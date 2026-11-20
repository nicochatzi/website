const columns = 160;
const rows = 100;
const Field = [rows][columns]f32;

var fields: [2]Field = @splat(@splat(@splat(0)));
var front: usize = 0;

export fn width() usize {
    return columns;
}

export fn height() usize {
    return rows;
}

export fn clear() void {
    fields = @splat(@splat(@splat(0)));
}

export fn drop(x: f32, y: f32, strength: f32) void {
    const cx = x * (columns - 1);
    const cy = y * (rows - 1);
    const ix: i32 = @intFromFloat(cx);
    const iy: i32 = @intFromFloat(cy);
    var row = @max(0, iy - 6);
    while (row <= @min(rows - 1, iy + 6)) : (row += 1) {
        var col = @max(0, ix - 6);
        while (col <= @min(columns - 1, ix + 6)) : (col += 1) {
            const dx = @as(f32, @floatFromInt(col)) - cx;
            const dy = @as(f32, @floatFromInt(row)) - cy;
            const radius = (dx * dx + dy * dy) / 25;
            if (radius >= 1) continue;
            const displacement = strength * (1 - radius) * (1 - radius) * (1 - 4 * radius);
            for (&fields) |*field| {
                const cell = &field[@intCast(row)][@intCast(col)];
                cell.* = @min(3, @max(-3, cell.* + displacement));
            }
        }
    }
}

fn step(damping: f32) f32 {
    const current = &fields[front];
    const next = &fields[1 - front];
    const retention = 0.998 - 0.035 * damping * damping;
    var low = current[0][0];
    var high = low;
    var max_speed: f32 = 0;
    for (0..rows) |y| {
        const north = &current[y -| 1];
        const south = &current[@min(y + 1, rows - 1)];
        for (0..columns) |x| {
            const here = current[y][x];
            const laplacian = north[x] + south[x] + current[y][x -| 1] + current[y][@min(x + 1, columns - 1)] - 4 * here;
            const velocity = retention * (here - next[y][x]) + 0.34 * laplacian;
            next[y][x] = here + velocity;
            low = @min(low, here);
            high = @max(high, here);
            max_speed = @max(max_speed, @abs(velocity));
        }
    }
    front = 1 - front;
    return @max(high - low, max_speed);
}

const std = @import("std");
const harmony = @import("harmony.zig");
const dt = 1.0 / 120.0;
const Vec = [2]f32;

var walk = harmony.Walk{ .random = .init(0) };
var remaining: f32 = 6;
var revision: u32 = 0;
var swim_time: f64 = 0;
var travel: f32 = 0;
var side: f32 = 1;
var swimmer: Vec = .{ 0.5, 0.5 };
var strengths: [3]f32 = @splat(0);

const Pickup = struct {
    position: Vec = .{ 0, 0 },
    previous: f32 = 0,
    slope: f32 = 0,
    trough: f32 = 0,
    cooldown: f32 = 0,

    fn heightAt(p: Vec) f32 {
        const x = p[0] * (columns - 1);
        const y = p[1] * (rows - 1);
        const col: usize = @intFromFloat(x);
        const row: usize = @intFromFloat(y);
        const fx = x - @floor(x);
        const fy = y - @floor(y);
        const water = &fields[front];
        const right = @min(col + 1, columns - 1);
        const below = @min(row + 1, rows - 1);
        return (1 - fy) * ((1 - fx) * water[row][col] + fx * water[row][right]) +
            fy * ((1 - fx) * water[below][col] + fx * water[below][right]);
    }

    fn listen(self: *Pickup) f32 {
        const h = heightAt(self.position);
        const slope = h - self.previous;
        self.cooldown -= dt;
        if (self.slope <= 0 and slope > 0) self.trough = self.previous;
        const prominence = self.previous - self.trough;
        const strike = self.slope > 0 and slope <= 0 and prominence > 0.0024 and self.cooldown <= 0;
        self.previous = h;
        self.slope = slope;
        if (!strike) return 0;
        self.cooldown = 0.16;
        return prominence * 0.75;
    }
};
var pickups: [3]Pickup = @splat(.{});

export fn init(seed: u32) void {
    walk.random = .init(seed);
    swim_time = walk.random.random().float(f64) * 100;
}

export fn move_pickup(index: usize, x: f32, y: f32) void {
    const position = Vec{ x, y };
    const h = Pickup.heightAt(position);
    pickups[index] = .{ .position = position, .previous = h, .trough = h };
}

export fn set_chord(root: u8, shape: u8) void {
    walk.select(root, shape);
    remaining = 6;
    revision +%= 1;
}

export fn chord() *const harmony.Chord {
    return &walk.chord;
}

export fn chord_revision() u32 {
    return revision;
}

export fn swimmer_position() *const Vec {
    return &swimmer;
}

export fn strikes() *const [3]f32 {
    return &strengths;
}

fn paddle() void {
    swim_time += dt;
    const t = swim_time;
    swimmer = .{
        @floatCast(0.5 + 0.33 * @sin(0.28 * t) + 0.095 * @sin(0.61 * t + 1.4)),
        @floatCast(0.5 + 0.29 * @sin(0.39 * t + 0.9) + 0.11 * @cos(0.73 * t)),
    };
    const vx: f32 = @floatCast(columns * (0.33 * 0.28 * @cos(0.28 * t) + 0.095 * 0.61 * @cos(0.61 * t + 1.4)));
    const vy: f32 = @floatCast(rows * (0.29 * 0.39 * @cos(0.39 * t + 0.9) - 0.11 * 0.73 * @sin(0.73 * t)));
    const speed = @sqrt(vx * vx + vy * vy);
    travel += dt * speed;
    if (travel < 2.3 or speed == 0) return;
    travel -= 2.3;
    side = -side;
    const dx = vx / speed;
    const dy = vy / speed;
    const stroke: f32 = @floatCast(@sin(3 * t));
    drop(swimmer[0] - (2 * dx + side * 1.5 * dy) / columns, swimmer[1] - (2 * dy - side * 1.5 * dx) / rows, 0.34 + 0.16 * stroke * stroke);
}

export fn tick(damping: f32, alive: bool) f32 {
    if (alive) {
        paddle();
        remaining -= dt;
        if (remaining <= 0) {
            walk.advance();
            revision +%= 1;
            remaining = 5 + 3 * walk.random.random().float(f32);
        }
    }
    const activity = step(damping);
    for (&pickups, &strengths) |*pickup, *strength| strength.* = pickup.listen();
    return activity;
}

export fn wake(x0: f32, y0: f32, x1: f32, y1: f32) bool {
    const dx = (x1 - x0) * columns;
    const dy = (y1 - y0) * rows;
    const distance = @sqrt(dx * dx + dy * dy);
    if (distance < 2.5) return false;
    const count: usize = @intFromFloat(@ceil(distance / 2.5));
    for (0..count) |i| {
        const u = @as(f32, @floatFromInt(i + 1)) / @as(f32, @floatFromInt(count));
        drop(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 0.24);
    }
    return true;
}

const Segment = [2]Vec;
var segments: [2 * (columns - 1) * (rows - 1)]Segment = undefined;
export fn contour_buffer() [*]const Segment {
    return &segments;
}

export fn contour(level: f32) usize {
    const water = &fields[front];
    var count: usize = 0;
    for (0..rows - 1) |row| {
        for (0..columns - 1) |col| {
            const a = water[row][col];
            const b = water[row][col + 1];
            const c = water[row + 1][col + 1];
            const d = water[row + 1][col];
            if (level < @min(a, b, c, d) or level >= @max(a, b, c, d)) continue;
            const x: f32 = @floatFromInt(col);
            const y: f32 = @floatFromInt(row);
            var edges: [4]Vec = undefined;
            var n: usize = 0;
            if ((a > level) != (b > level)) {
                edges[n] = .{ x + (level - a) / (b - a), y };
                n += 1;
            }
            if ((b > level) != (c > level)) {
                edges[n] = .{ x + 1, y + (level - b) / (c - b) };
                n += 1;
            }
            if ((c > level) != (d > level)) {
                edges[n] = .{ x + (level - d) / (c - d), y + 1 };
                n += 1;
            }
            if ((d > level) != (a > level)) {
                edges[n] = .{ x, y + (level - a) / (d - a) };
                n += 1;
            }
            const swap = n == 4 and ((a > level) != ((a + b + c + d) / 4 > level));
            segments[count] = .{ edges[0], edges[if (swap) 3 else 1] };
            count += 1;
            if (n == 4) {
                segments[count] = .{ edges[2], edges[if (swap) 1 else 3] };
                count += 1;
            }
        }
    }
    return count;
}

var mallet: [8192]f32 = undefined;

export fn pulse_buffer() [*]const f32 {
    return &mallet;
}

export fn excite(hz: f32, sample_rate: f32, crest: f32) usize {
    const force = @min(1, std.math.pow(f32, crest, 0.4) * 1.55);
    const length: usize = @intFromFloat(@min(mallet.len, @max(3, @round(sample_rate * (0.58 - 0.43 * force) / hz))));
    const span: f32 = @floatFromInt(length - 1);
    for (mallet[0..length], 0..) |*sample, i| {
        const s = @sin(std.math.pi * @as(f32, @floatFromInt(i)) / span);
        sample.* = 0.68 * force * s * s / span;
    }
    return length;
}
