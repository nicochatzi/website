const std = @import("std");

var points: [1024][2]f32 = undefined;

// One closed period, excluding the repeated endpoint so the audio loops cleanly.
export fn trace(x_cycles: u32, y_cycles: u32, phase: f32) [*]const [2]f32 {
    for (&points, 0..) |*point, i| {
        const t = 2.0 * std.math.pi * @as(f32, @floatFromInt(i)) / points.len;
        point.* = .{
            @sin(t * @as(f32, @floatFromInt(x_cycles))),
            @sin(t * @as(f32, @floatFromInt(y_cycles)) + phase),
        };
    }
    return &points;
}

export fn point_count() u32 {
    return points.len;
}
