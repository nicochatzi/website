const std = @import("std");

const Mode = struct {
    m: f32,
    n: f32,
    balance: f32,
    midi: u8,
};

const modes = [_]Mode{
    .{ .m = 4, .n = 2, .balance = 0.86, .midi = 50 },
    .{ .m = 3, .n = 1, .balance = -0.74, .midi = 54 },
    .{ .m = 4, .n = 0, .balance = 0.81, .midi = 57 },
    .{ .m = 5, .n = 3, .balance = 0.91, .midi = 59 },
    .{ .m = 6, .n = 2, .balance = -0.8, .midi = 62 },
    .{ .m = 6, .n = 4, .balance = 0.72, .midi = 64 },
    .{ .m = 7, .n = 1, .balance = -0.87, .midi = 66 },
    .{ .m = 8, .n = 2, .balance = 0.62, .midi = 69 },
};
const phrase = [_]usize{ 0, 2, 3, 1, 4, 6, 5, 3, 7, 4, 2, 1 };
const travel = 1.4;
const dwell = 1.0;
const Point = @Vector(2, f32);
const grains = 6800;
var figures: [modes.len][grains]Point = undefined;
var points: [grains]Point = undefined;
var origins: [grains]Point = undefined;
var seed: u32 = 0;
var pitch: f32 = 0;
var start_pitch: f32 = 0;
var target: usize = 0;
var phrase_index: usize = 0;
var elapsed: f32 = travel;

fn random() f32 {
    seed = seed *% 1664525 +% 1013904223;
    return @as(f32, @floatFromInt(seed >> 8)) / 16777216.0;
}

fn bounded(p: Point) Point {
    return @max(@as(Point, @splat(0)), @min(@as(Point, @splat(1)), p));
}

fn settle(mode: Mode, anchor: Point) Point {
    const m = mode.m * std.math.pi;
    const n = mode.n * std.math.pi;
    var p = anchor;
    for (0..10) |_| {
        const mx = m * p[0];
        const my = m * p[1];
        const nx = n * p[0];
        const ny = n * p[1];
        const value = @cos(mx) * @cos(ny) + mode.balance * @cos(nx) * @cos(my);
        const dx = -m * @sin(mx) * @cos(ny) - mode.balance * n * @sin(nx) * @cos(my);
        const dy = -n * @cos(mx) * @sin(ny) - mode.balance * m * @cos(nx) * @sin(my);
        const gradient: Point = .{ dx, dy };
        const step = value / @max(1, dx * dx + dy * dy);
        const offset = gradient * @as(Point, @splat(step));
        p = bounded(p - std.math.clamp(offset, @as(Point, @splat(-0.035)), @as(Point, @splat(0.035))));
    }
    return p;
}

export fn init() [*]const Point {
    seed = 317;
    for (0..grains) |i| {
        const anchor: Point = .{ random(), random() };
        const spread = if (i % 9 == 0) @as(f32, 0.018) else 0.0045;
        const dust: Point = .{ (random() - random()) * spread, (random() - random()) * spread };
        for (modes, &figures) |mode, *figure| {
            figure[i] = if (i % 41 == 0) anchor else bounded(settle(mode, anchor) + dust);
        }
    }
    target = 0;
    phrase_index = 0;
    elapsed = travel;
    pitch = modes[0].midi;
    points = figures[0];
    return &points;
}

export fn count() usize {
    return grains;
}

export fn note_count() usize {
    return modes.len;
}

export fn selected() usize {
    return target;
}

export fn note(index: usize) u8 {
    return modes[@min(index, modes.len - 1)].midi;
}

export fn select(index: usize) void {
    const next = @min(index, modes.len - 1);
    if (next == target) return;
    origins = points;
    start_pitch = pitch;
    target = next;
    elapsed = 0;
}

export fn advance(seconds: f32, alive: bool) f32 {
    const dt = std.math.clamp(seconds, 0, 0.1);
    if (elapsed < travel) {
        elapsed = @min(travel, elapsed + dt);
        const t = 8 * elapsed / travel;
        const mix = (1 - (1 + t) * @exp(-t)) / (1 - 9 * @exp(@as(f32, -8)));
        for (&points, origins, figures[target]) |*p, from, to| {
            p.* = from + (to - from) * @as(Point, @splat(mix));
        }
        const dest: f32 = @floatFromInt(modes[target].midi);
        pitch = start_pitch + mix * (dest - start_pitch);
    } else if (alive) {
        elapsed += dt;
        if (elapsed >= travel + dwell) {
            phrase_index = (phrase_index + 1) % phrase.len;
            if (phrase[phrase_index] == target) phrase_index = (phrase_index + 1) % phrase.len;
            select(phrase[phrase_index]);
        }
    } else elapsed = travel;
    return 440 * @exp2((pitch - 69) / 12);
}

test "a glide retargets continuously and dwells for a second before the next note" {
    _ = init();
    const first = advance(0, true);
    select(4);
    try std.testing.expectEqual(first, advance(0, false));
    const intermediate = advance(0.1, false);
    try std.testing.expect(intermediate > first);
    const before = points[173];
    select(2);
    try std.testing.expectEqual(intermediate, advance(0, false));
    try std.testing.expectEqual(before, points[173]);
    for (0..15) |_| _ = advance(0.1, false);
    const held = advance(0, false);
    for (0..9) |_| try std.testing.expectEqual(held, advance(0.1, true));
    try std.testing.expectEqual(@as(usize, 2), selected());
    for (0..2) |_| _ = advance(0.1, true);
    try std.testing.expect(selected() != 2);
}
