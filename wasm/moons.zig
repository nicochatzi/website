//! Umbra and penumbra geometry: https://eclipse.gsfc.nasa.gov/SEhelp/SEgeometry.html

const std = @import("std");

const band_count = 12;
const band_width = 16;
const strip_start = -96;
const sunlight = .{ .slope_x = 0.48, .slope_z = 0.16, .angular_slope = 0.12 };
const stretch = @sqrt(1 + sunlight.slope_x * sunlight.slope_x + sunlight.slope_z * sunlight.slope_z);
var zoom: f32 = 0.93;
const max_height = 240;
const min_width = 8;
const max_width = 320;
const center_x_limit = 153;
const center_z_limit = 80;
const Pt = @Vector(2, f32);

const Camera = struct {
    yaw: f32 = 0.09,
    pitch: f32 = 0.09,

    fn centerY(self: Camera) f32 {
        return 180 + 45 * @cos(self.pitch);
    }

    fn project(self: Camera, x: f32, y: f32, z: f32) Pt {
        const side = x * @cos(self.yaw) - z * @sin(self.yaw);
        const forward = x * @sin(self.yaw) + z * @cos(self.yaw);
        return .{ 320 + zoom * side, self.centerY() + zoom * (forward * @sin(self.pitch) - y * @cos(self.pitch)) };
    }
};
var camera: Camera = .{};

export fn rotate(dx: f32, dy: f32) void {
    camera.yaw = @mod(camera.yaw + dx + std.math.pi, 2 * std.math.pi) - std.math.pi;
    camera.pitch = std.math.clamp(camera.pitch + dy, -std.math.pi / 2.0, std.math.pi / 2.0);
    zoom = framingScale();
}

export fn reset_view() void {
    camera = .{};
    zoom = framingScale();
}

const Orbit = struct {
    cx: f32,
    cz: f32,
    height: f32,
    a: f32,
    b: f32,
    rise: f32,
    tilt: f32,
    radius: f32,
    phase: f32,
    period: f32,
    speed: f32 = 1,

    fn verticalRise(o: Orbit) f32 {
        const clearance = o.height - o.radius;
        return std.math.clamp(o.rise, -clearance, clearance);
    }

    fn location(o: Orbit, u: f32, v: f32) [3]f32 {
        const c = @cos(o.tilt);
        const s = @sin(o.tilt);
        return .{ o.cx + o.a * u * c - o.b * v * s, o.height + v * o.verticalRise(), o.cz + o.a * u * s + o.b * v * c };
    }

    fn screen(o: Orbit, u: f32, v: f32) Pt {
        const point = o.location(u, v);
        return camera.project(point[0], point[1], point[2]);
    }
};

var orbits = [_]Orbit{
    .{ .cx = -131, .cz = -18, .height = 78, .a = 49, .b = 31, .rise = 14, .tilt = -0.45, .radius = 34, .phase = -1.9, .period = 19 },
    .{ .cx = -15, .cz = -27, .height = 57, .a = 36, .b = 26, .rise = -11, .tilt = 0.65, .radius = 32, .phase = 1.1, .period = -27 },
    .{ .cx = 91, .cz = -63, .height = 89, .a = 46, .b = 32, .rise = 12, .tilt = -0.24, .radius = 37, .phase = 2.0, .period = 33 },
};

const Body = extern struct {
    x: f32,
    y: f32,
    radius: f32,
    depth: f32,
    height: f32,
    shadow_x: f32,
    shadow_z: f32,
    world_radius: f32,
    shadow_major: f32,
    shadow_minor: f32,
    shadow_angle: f32,
    core_fraction: f32,
    orbit_ux: f32,
    orbit_uy: f32,
    orbit_vx: f32,
    orbit_vy: f32,
    orbit_x: f32,
    orbit_y: f32,
    width: f32,
    speed: f32,
};
var bodies: [orbits.len]Body = undefined;
var floor_matrix: [6]f32 = undefined;
var projected_ray: [2]f32 = undefined;
var exposure: [band_count]f32 = undefined;

export fn move(index: usize, dx: f32, dy: f32) void {
    const o = &orbits[index];
    const side = dx / zoom;
    const pitch_sin = @sin(camera.pitch);
    const forward = (dy / zoom) * pitch_sin / @max(pitch_sin * pitch_sin, 0.04);
    o.cx = std.math.clamp(o.cx + side * @cos(camera.yaw) + forward * @sin(camera.yaw), -center_x_limit, center_x_limit);
    o.cz = std.math.clamp(o.cz - side * @sin(camera.yaw) + forward * @cos(camera.yaw), -center_z_limit, center_z_limit);
}

export fn lift(index: usize, height: f32) void {
    orbits[index].height = std.math.clamp(height, orbits[index].radius, max_height);
    zoom = framingScale();
}

export fn set_width(index: usize, width: f32) void {
    orbits[index].a = std.math.clamp(width, min_width, max_width) * 0.5;
    zoom = framingScale();
}

export fn set_speed(index: usize, speed: f32) void {
    orbits[index].speed = std.math.clamp(speed, 0, 2);
}

const Footprint = struct {
    x: f32,
    z: f32,
    core: f32,
    outer: f32,

    fn project(p: [3]f32, radius: f32) Footprint {
        const spread = p[1] * sunlight.angular_slope;
        return .{
            .x = p[0] + p[1] * sunlight.slope_x,
            .z = p[2] + p[1] * sunlight.slope_z,
            .core = @max(0, radius - spread),
            .outer = radius + spread,
        };
    }

    fn transmission(self: Footprint, x: f32) f32 {
        const dx = x - self.x;
        const dz = -self.z;
        const along = (dx * sunlight.slope_x + dz * sunlight.slope_z) / stretch;
        const distance = @sqrt(@max(0, dx * dx + dz * dz - along * along));
        return std.math.clamp((distance - self.core) / (self.outer - self.core), 0, 1);
    }
};

fn bandLight(shadows: []const Footprint, start: f32) f32 {
    var sum: f32 = 0;
    for (0..band_width) |i| {
        const x = start + @as(f32, @floatFromInt(i)) + 0.5;
        var transmission: f32 = 1;
        for (shadows) |shadow| transmission *= shadow.transmission(x);
        sum += transmission;
    }
    return sum / band_width;
}

fn framingScale() f32 {
    const cy = @abs(@cos(camera.yaw));
    const sy = @abs(@sin(camera.yaw));
    const cp = @cos(camera.pitch);
    const sp = @sin(camera.pitch);
    const max_side = center_x_limit * cy + center_z_limit * sy;
    const max_forward = (center_x_limit * sy + center_z_limit * cy) * @abs(sp);
    const deck_extent = (217 * sy + 106 * cy) * @abs(sp);
    const ray_slope = cp + sp * (sunlight.slope_x * @sin(camera.yaw) + sunlight.slope_z * @cos(camera.yaw));
    const strip_extent = 96 * sy * @abs(sp);
    var top = @max(deck_extent, strip_extent - 112 * ray_slope);
    var bottom = @max(deck_extent, strip_extent + 112 * ray_slope);
    var scale: f32 = 0.93;
    for (orbits) |o| {
        const c = @cos(camera.yaw + o.tilt);
        const s = @sin(camera.yaw + o.tilt);
        const side_radius = std.math.hypot(o.a * c, o.b * s);
        const vertical_radius = std.math.hypot(o.a * s * sp, o.b * c * sp - o.verticalRise() * cp);
        const extent = max_forward + vertical_radius + o.radius;
        scale = @min(scale, 315 / (max_side + side_radius + o.radius));
        top = @max(top, extent + o.height * cp);
        bottom = @max(bottom, extent - o.height * cp);
    }
    return @min(scale, (camera.centerY() - 5) / top, (355 - camera.centerY()) / bottom);
}

export fn advance(seconds: f32, held: i32) void {
    var shadows: [orbits.len]Footprint = undefined;
    const origin = camera.project(0, 0, 0);
    const axis_x = camera.project(1, 0, 0) - origin;
    const axis_z = camera.project(0, 0, 1) - origin;
    floor_matrix = .{ axis_x[0], axis_x[1], axis_z[0], axis_z[1], origin[0], origin[1] };
    projected_ray = camera.project(sunlight.slope_x, -1, sunlight.slope_z) - origin;
    for (&orbits, &bodies, 0..) |*o, *body, i| {
        if (seconds > 0 and o.speed > 0 and held != @as(i32, @intCast(i))) {
            o.phase = @mod(o.phase + seconds * o.speed * (2 * std.math.pi) / o.period, 2 * std.math.pi);
        }
        const p = o.location(@cos(o.phase), @sin(o.phase));
        const screen = camera.project(p[0], p[1], p[2]);
        const center = o.screen(0, 0);
        const u = o.screen(1, 0) - center;
        const v = o.screen(0, 1) - center;
        const footprint = Footprint.project(p, o.radius);
        body.* = .{
            .x = screen[0],
            .y = screen[1],
            .radius = o.radius * zoom,
            .depth = (p[0] * @sin(camera.yaw) + p[2] * @cos(camera.yaw)) * @cos(camera.pitch) + p[1] * @sin(camera.pitch),
            .height = o.height,
            .shadow_x = footprint.x,
            .shadow_z = footprint.z,
            .shadow_major = footprint.outer * stretch,
            .shadow_minor = footprint.outer,
            .shadow_angle = std.math.atan2(@as(f32, sunlight.slope_z), sunlight.slope_x) * (180.0 / std.math.pi),
            .core_fraction = footprint.core / footprint.outer,
            .world_radius = o.radius,
            .orbit_ux = u[0],
            .orbit_uy = u[1],
            .orbit_vx = v[0],
            .orbit_vy = v[1],
            .orbit_x = center[0],
            .orbit_y = center[1],
            .width = 2 * o.a,
            .speed = o.speed,
        };
        shadows[i] = footprint;
    }
    for (&exposure, 0..) |*value, i| value.* = bandLight(&shadows, strip_start + band_width * @as(f32, @floatFromInt(i)));
}

export fn positions() [*]const Body {
    return &bodies;
}

export fn floor_transform() [*]const f32 {
    return &floor_matrix;
}

export fn light_ray() [*]const f32 {
    return &projected_ray;
}

export fn bands() [*]const f32 {
    return &exposure;
}

test "lifting a centered moon shrinks totality and widens partial shade" {
    const radius: f32 = 32;
    const low = Footprint.project(.{ -sunlight.slope_x * radius, radius, -sunlight.slope_z * radius }, radius);
    const high = Footprint.project(.{ -sunlight.slope_x * max_height, max_height, -sunlight.slope_z * max_height }, radius);
    try std.testing.expect(high.core < low.core and high.outer > low.outer);
    try std.testing.expectEqual(@as(f32, 0), bandLight(&.{low}, 8));
    try std.testing.expect(bandLight(&.{high}, 8) > 0);
    try std.testing.expectEqual(@as(f32, 1), bandLight(&.{low}, 42));
    try std.testing.expect(bandLight(&.{high}, 42) < 1);
}

test "three low moons can extinguish the strip and rotating the camera preserves the sound" {
    const saved = orbits;
    defer orbits = saved;
    defer reset_view();
    for (&orbits, [_]f32{ -64, -1, 63 }) |*o, x| {
        o.height = o.radius;
        const p = o.location(@cos(o.phase), @sin(o.phase));
        const shadow = Footprint.project(p, o.radius);
        o.cx += x - shadow.x;
        o.cz -= shadow.z;
    }
    advance(0, -1);
    for (exposure) |value| try std.testing.expectEqual(@as(f32, 0), value);
    lift(0, 180);
    advance(0, -1);
    try std.testing.expect(exposure[0] > 0);
    const previous = exposure;
    rotate(0.48, 0.13);
    advance(0, -1);
    try std.testing.expectEqual(previous, exposure);
}

test "each moon advances from its own phase at its selected speed" {
    const saved = orbits;
    defer orbits = saved;
    set_speed(0, 0);
    set_speed(1, 2);
    advance(1, -1);
    try std.testing.expectEqual(saved[0].phase, orbits[0].phase);
    for ([_]f32{ 2, 1 }, 1..) |speed, i| {
        const delta = speed * (2 * std.math.pi) / saved[i].period;
        try std.testing.expectApproxEqAbs(saved[i].phase + delta, orbits[i].phase, 0.00001);
    }
    const phase = orbits[1].phase;
    set_speed(1, 0.5);
    advance(1, 1);
    try std.testing.expectEqual(phase, orbits[1].phase);
    advance(1, -1);
    try std.testing.expectApproxEqAbs(phase + std.math.pi / saved[1].period, orbits[1].phase, 0.00001);
}

test "width changes the sweep about the same orbit center at a fixed height and moon size" {
    const saved = orbits;
    defer orbits = saved;
    const o = &orbits[1];
    const center = o.location(0, 0);
    for ([_]f32{ 0, 90, 400 }, [_]f32{ min_width, 90, max_width }) |requested, expected| {
        set_width(1, requested);
        advance(0, 1);
        const start = o.location(-1, 0);
        const end = o.location(1, 0);
        const dx = end[0] - start[0];
        const dz = end[2] - start[2];
        try std.testing.expectApproxEqAbs(expected, @sqrt(dx * dx + dz * dz), 0.0001);
        try std.testing.expectEqual(expected, bodies[1].width);
        try std.testing.expectEqual(center, o.location(0, 0));
        try std.testing.expectEqual(saved[1].radius, bodies[1].world_radius);
    }
}

test "full control travel keeps the moon above the floor and inside the view" {
    const saved = orbits;
    defer orbits = saved;
    defer reset_view();
    for ([_]f32{ -2.7, -1.57, 0, 0.62, std.math.pi }) |yaw| {
        for ([_]f32{ -std.math.pi / 2.0, -0.9, 0, 0.77, std.math.pi / 2.0 }) |pitch| {
            camera = .{ .yaw = yaw, .pitch = pitch };
            for (&orbits, 0..) |*o, i| {
                set_width(i, max_width);
                for ([_]f32{ o.radius, max_height }) |height| {
                    lift(i, height);
                    for ([_]f32{ -153, 153 }) |x| {
                        for ([_]f32{ -80, 80 }) |z| {
                            o.cx = x;
                            o.cz = z;
                            for (0..24) |phase| {
                                o.phase = @as(f32, @floatFromInt(phase)) * std.math.pi / 12.0;
                                advance(0, -1);
                                const b = bodies[i];
                                try std.testing.expect(b.x >= b.radius and b.x + b.radius <= 640);
                                try std.testing.expect(b.y >= b.radius and b.y + b.radius <= 360);
                                try std.testing.expect(o.location(@cos(o.phase), @sin(o.phase))[1] >= o.radius);
                            }
                        }
                    }
                }
            }
        }
    }
}
