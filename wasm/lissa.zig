//! The frequency and phase relationships behind the trace: https://mathworld.wolfram.com/LissajousCurve.html

const std = @import("std");

const Point = [3]f32;
const Camera = struct {
    cy: f32,
    sy: f32,
    ct: f32,
    st: f32,

    fn project(self: Camera, x: f32, y: f32, z: f32) Point {
        const side = self.cy * x - self.sy * z;
        const forward = self.sy * x + self.cy * z;
        const depth = self.st * y + self.ct * forward;
        const scale = 104 / (1 - depth / 6);
        return .{ 280 + scale * side, 195 - scale * (self.ct * y - self.st * forward), depth };
    }
};

var camera: Camera = undefined;
var points: [1024]Point = undefined;

export fn view(yaw: f32, tilt: f32) void {
    camera = .{ .cy = @cos(yaw), .sy = @sin(yaw), .ct = @cos(tilt), .st = @sin(tilt) };
}

export fn trace(x_hz: f32, y_hz: f32, phase: f32, z_hz: f32) [*]const Point {
    var previous: f32 = 0;
    for (&points, 0..) |*point, i| {
        const angle = (2.0 * std.math.pi / 55.0) * @as(f32, @floatFromInt(i)) / (points.len - 1);
        point.* = camera.project(@sin(angle * x_hz), @sin(angle * y_hz + phase), @cos(angle * z_hz));
        const depth = point[2];
        point[2] = std.math.clamp(@floor(((previous + depth) / 7 + 0.5) * 12), 0, 11);
        previous = depth;
    }
    return &points;
}

export fn point_count() usize {
    return points.len;
}

// Perlin’s quintic fade between targets: https://mrl.cs.nyu.edu/~perlin/noise/
const Axis = struct {
    from: f32,
    to: f32,
    elapsed: f32 = 0,
    duration: f32 = 0,

    fn progress(self: *Axis, dt: f32) f32 {
        const rng = random.random();
        if (self.elapsed >= self.duration) {
            self.elapsed -= self.duration;
            self.from = self.to;
            const sweep = rng.float(f32) < 0.24;
            const pick = rng.float(f32);
            self.to = if (!sweep) pick else if (self.from < 0.5) 0.78 + 0.22 * pick else 0.22 * pick;
            self.duration = if (sweep) 0.7 + 0.7 * rng.float(f32) else 2.8 + 4.5 * rng.float(f32);
        }
        self.elapsed += dt;
        const u = @min(1, self.elapsed / self.duration);
        return self.from + (self.to - self.from) * u * u * u * (10 + u * (-15 + 6 * u));
    }
};

var random: std.Random.DefaultPrng = .init(0);
var axes: [4]Axis = undefined;
var position: [4]f32 = undefined;

export fn begin_motion(seed: u32, x: f32, y: f32, z: f32, pitch: f32) void {
    random = .init(seed);
    position = .{ x, y, z, pitch };
    for (&axes, position) |*axis, value| axis.* = .{ .from = value, .to = value };
}

export fn motion(dt: f32) [*]const f32 {
    const blend = 1 - @exp(-dt / 0.055);
    for (&axes, &position) |*axis, *value| value.* += (axis.progress(dt) - value.*) * blend;
    return &position;
}
