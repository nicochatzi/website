const std = @import("std");

var points: [1024][3]f32 = undefined;

// A fixed scope timebase. Fractional cycles need not end where they began.
export fn trace(x_hz: f32, y_hz: f32, phase: f32, z_hz: f32) [*]const [3]f32 {
    for (&points, 0..) |*point, i| {
        const t = (2.0 * std.math.pi / 55.0) * @as(f32, @floatFromInt(i)) / (points.len - 1);
        point.* = .{ @sin(t * x_hz), @sin(t * y_hz + phase), @cos(t * z_hz) };
    }
    return &points;
}

export fn point_count() u32 {
    return points.len;
}
