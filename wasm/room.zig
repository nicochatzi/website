const std = @import("std");

const delay_seconds = [8]f32{ 0.02371, 0.02983, 0.03317, 0.03791, 0.04147, 0.04613, 0.05159, 0.05723 };
const ring_size = 16384;
const ring_mask = ring_size - 1;
const block = 128;
const decay_seconds = 1.85;
const return_gain = 0.104;
var lines: [8][ring_size]f32 = @splat(@splat(0));
var lengths: [8]usize = undefined;
var feedback: [8]f32 = undefined;
var low: [8]f32 = @splat(0);
var cursor: usize = 0;
var left: [block]f32 = @splat(0);
var right: [block]f32 = @splat(0);
var bass: [2]f32 = @splat(0);
var bass_coeff: f32 = 0;
var treble_coeff: f32 = 0;

const Diffuser = struct {
    ring: [2048]f32 = @splat(0),
    length: usize = 1,

    fn tick(self: *Diffuser, in: f32) f32 {
        const delayed = self.ring[(cursor -% self.length) & (self.ring.len - 1)];
        const out = delayed - 0.57 * in;
        self.ring[cursor & (self.ring.len - 1)] = in + 0.57 * out;
        return out;
    }
};
var diffusion: [4]Diffuser = undefined;

const Modulator = struct {
    phase: f64,
    increment: f64,
    depth: f32,

    fn tap(self: *Modulator, line: usize) f32 {
        self.phase += self.increment;
        if (self.phase >= 1) self.phase -= 1;
        const p: f32 = @floatCast(self.phase);
        const triangle = 1 - 4 * @abs(p - 0.5);
        const delay = @as(f32, @floatFromInt(lengths[line])) + self.depth * triangle * (2 - @abs(triangle));
        const whole = @floor(delay);
        const index = (cursor -% @as(usize, @intFromFloat(whole))) & ring_mask;
        const a = lines[line][index];
        return a + (lines[line][(index -% 1) & ring_mask] - a) * (delay - whole);
    }
};
var motion: [2]Modulator = undefined;

fn samples(seconds: f32, rate: f32, maximum: usize) usize {
    return @intFromFloat(@max(1, @min(@as(f32, @floatFromInt(maximum)), @round(seconds * rate))));
}

export fn init(rate: f32) void {
    lines = @splat(@splat(0));
    low = @splat(0);
    bass = @splat(0);
    cursor = 0;
    for (delay_seconds, 0..) |seconds, i| {
        lengths[i] = samples(seconds, rate, ring_size - 128);
        const duration = @as(f32, @floatFromInt(lengths[i])) / rate;
        feedback[i] = @exp(-6.907755 * duration / decay_seconds);
    }
    for (&diffusion, [4]f32{ 0.00319, 0.00671, 0.00413, 0.00793 }) |*d, seconds|
        d.* = .{ .length = samples(seconds, rate, d.ring.len - 1) };
    for (&motion, [2]f64{ 0.19, 0.31 }, [2]f64{ 0.12, 0.61 }) |*m, hz, phase|
        m.* = .{ .phase = phase, .increment = hz / rate, .depth = @min(96, rate * 0.00018) };
    bass_coeff = 1 - @exp(-2.0 * std.math.pi * 100.0 / rate);
    treble_coeff = 1 - @exp(-2.0 * std.math.pi * 3200.0 / rate);
}

export fn left_buffer() [*]f32 {
    return &left;
}
export fn right_buffer() [*]f32 {
    return &right;
}

export fn process(frames: usize) void {
    for (0..frames) |n| {
        bass[0] += bass_coeff * (left[n] - bass[0]);
        bass[1] += bass_coeff * (right[n] - bass[1]);
        const l = diffusion[1].tick(diffusion[0].tick(left[n] - bass[0]));
        const r = diffusion[3].tick(diffusion[2].tick(right[n] - bass[1]));
        var tap: [8]f32 = undefined;
        inline for (0..8) |i| {
            tap[i] = switch (i) {
                2 => motion[0].tap(i),
                7 => motion[1].tap(i),
                else => lines[i][(cursor -% lengths[i]) & ring_mask],
            };
        }
        left[n] = return_gain * (tap[0] + tap[2] - tap[4] - tap[6]);
        right[n] = return_gain * (tap[1] - tap[3] - tap[5] + tap[7]);
        inline for (0..3) |stage| {
            const stride = 1 << stage;
            inline for (0..8) |i| {
                if (i & stride == 0) {
                    const a = tap[i];
                    const b = tap[i + stride];
                    tap[i] = a + b;
                    tap[i + stride] = a - b;
                }
            }
        }
        const send = [8]f32{ l, r, -r, l, r, -l, l, r };
        inline for (0..8) |i| {
            low[i] += treble_coeff * (tap[i] - low[i]);
            const damped = 0.35 * tap[i] + 0.65 * low[i];
            const value = 0.5 * send[i] + (0.35355339 * feedback[i]) * damped;
            lines[i][cursor & ring_mask] = if (@abs(value) < 1e-18) 0 else value;
        }
        cursor +%= 1;
    }
}

test "a stereo impulse diffuses, decays and clears at common device rates" {
    for ([_]usize{ 44100, 48000, 96000, 192000 }) |rate| {
        init(@floatFromInt(rate));
        var early: f64 = 0;
        var tail: f64 = 0;
        var late: f64 = 0;
        var stereo_difference: f64 = 0;
        for (0..(rate * 2 / block)) |k| {
            left = @splat(0);
            right = @splat(0);
            if (k == 0) left[0] = 1;
            process(block);
            for (left, right, 0..) |l, r, i| {
                const t = k * block + i;
                const energy = l * l + r * r;
                try std.testing.expect(std.math.isFinite(energy));
                if (t < rate / 50) try std.testing.expectEqual(@as(f32, 0), energy);
                if (t < rate / 3) early += energy else if (t < rate / 2) tail += energy else if (t >= rate) late += energy;
                stereo_difference += (l - r) * (l - r);
            }
        }
        try std.testing.expect(early > 0.01 and early < 0.04);
        try std.testing.expect(stereo_difference > early * 0.1);
        try std.testing.expect(tail > early * 0.001 and late < early * 0.0001);
    }
}
