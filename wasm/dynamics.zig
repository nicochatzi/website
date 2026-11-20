const std = @import("std");

pub const ceiling = 0.22;
const max_delay = 512;

pub const Dynamics = struct {
    audio: [max_delay][2]f32 = @splat(.{ 0, 0 }),
    gains: [max_delay]f32 = @splat(1),
    index: usize = 0,
    delay: usize,
    attack: f32,
    release: f32,
    recovery: f32,
    envelope: f32 = 0,
    limit_gain: f32 = 1,
    gain_sum: f64,
    block_min: f32 = 1,
    previous_min: f32 = 1,
    inverse_delay: f32,

    pub fn init(rate: f32) Dynamics {
        const delay = std.math.clamp(@round(rate * 0.002), 1, max_delay);
        return .{
            .delay = @intFromFloat(delay),
            .gain_sum = delay,
            .inverse_delay = 1 / delay,
            .attack = 1 - @exp(-1 / (0.014 * rate)),
            .release = 1 - @exp(-1 / (0.18 * rate)),
            .recovery = 1 - @exp(-1 / (0.09 * rate)),
        };
    }

    pub fn tick(self: *Dynamics, l: f32, r: f32) [2]f32 {
        const peak = @max(@abs(l), @abs(r));
        const coefficient = if (peak > self.envelope) self.attack else self.release;
        self.envelope += coefficient * (peak - self.envelope);
        const threshold = 0.10;
        const compression = @sqrt(threshold / @max(threshold, self.envelope));
        const compressed_peak = peak * compression;
        const target = ceiling / @max(ceiling, compressed_peak);
        self.block_min = @min(self.block_min, target);
        const safe_gain = @min(self.previous_min, self.block_min);
        self.limit_gain = @min(safe_gain, self.limit_gain + self.recovery * (1 - self.limit_gain));
        const i = self.index;
        const delayed = self.audio[i];
        self.audio[i] = .{ l * compression, r * compression };
        self.gain_sum += @as(f64, self.limit_gain) - self.gains[i];
        self.gains[i] = self.limit_gain;
        self.index += 1;
        if (self.index == self.delay) {
            self.index = 0;
            self.previous_min = self.block_min;
            self.block_min = 1;
        }
        const gain = @as(f32, @floatCast(self.gain_sum)) * self.inverse_delay;
        return .{ delayed[0] * gain, delayed[1] * gain };
    }
};

test "quiet stereo passes at unity and linked peaks respect the ceiling" {
    for ([_]f32{ 44100, 48000, 96000, 192000 }) |rate| {
        var d = Dynamics.init(rate);
        for (0..d.delay) |_| try std.testing.expectEqual([2]f32{ 0, 0 }, d.tick(0.02, -0.01));
        const quiet = d.tick(0.02, -0.01);
        try std.testing.expectApproxEqAbs(0.02, quiet[0], 1e-7);
        try std.testing.expectApproxEqAbs(-0.01, quiet[1], 1e-7);
        var rng: std.Random.DefaultPrng = .init(7);
        for (0..100000) |n| {
            const x: f32 = if (n % 137 < 30) 4 * rng.random().float(f32) else 0.01;
            const pair = d.tick(-x, x * 0.5);
            try std.testing.expect(@abs(pair[0]) <= ceiling + 1e-6);
            try std.testing.expectApproxEqAbs(-pair[0] * 0.5, pair[1], 1e-6);
        }
    }
}

test "sustained notes compress two to one above threshold and release to unity" {
    var d = Dynamics.init(48000);
    var y: [2]f32 = undefined;
    for (0..48000) |_| y = d.tick(0.32, 0.16);
    try std.testing.expectApproxEqAbs(@sqrt(@as(f32, 0.32 * 0.10)), y[0], 0.0001);
    for (0..48000) |_| y = d.tick(0.02, 0.01);
    try std.testing.expectApproxEqAbs(0.02, y[0], 1e-5);
}
