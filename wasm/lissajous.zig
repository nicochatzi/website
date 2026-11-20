const std = @import("std");

const Point = [3]f32;
const sweep_seconds = 1.0 / 55.0;
var points: [1024]Point = undefined;

export fn trace(x_hz: f32, y_hz: f32, phase: f32, z_hz: f32) [*]const Point {
    for (&points, 0..) |*point, index| {
        const angle = (2.0 * std.math.pi * sweep_seconds) * @as(f32, @floatFromInt(index)) / (points.len - 1);
        point.* = .{
            @sin(angle * x_hz),
            @sin(angle * y_hz + phase),
            @cos(angle * z_hz),
        };
    }
    return &points;
}

export fn point_count() u32 {
    return points.len;
}
