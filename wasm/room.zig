//! Feedback delay networks for reverberation: https://www.dsprelated.com/freebooks/pasp/FDN_Reverberation.html

const std = @import("std");
const Dynamics = @import("dynamics.zig").Dynamics;

var dynamics: Dynamics = undefined;

const delay_seconds = [8]f32{ 0.02371, 0.02983, 0.03317, 0.03791, 0.04147, 0.04613, 0.05159, 0.05723 };
const ring_size = 16384;
const ring_mask = ring_size - 1;
const block = 128;
const decay_seconds = 4.8;
const return_gain = 0.38;
const scatter_seconds = [8]f32{ 0.00173, 0.00419, 0.00271, 0.00547, 0.00343, 0.00611, 0.00217, 0.00473 };
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

var scatter: [8]Diffuser = undefined;

const Entrance = struct {
    ring: [8192]f32 = @splat(0),
    taps: [3]usize,

    fn read(self: *const Entrance, tap: usize) f32 {
        return self.ring[(cursor -% self.taps[tap]) & (self.ring.len - 1)];
    }

    fn write(self: *Entrance, sample: f32) void {
        self.ring[cursor & (self.ring.len - 1)] = sample;
    }
};
var entrance: [2]Entrance = undefined;

const Wander = struct {
    phase: f32,
    increment: f32,
    depth: f32,
    from: f32,
    to: f32,
    seed: u32,

    fn tap(self: *Wander, line: usize) f32 {
        self.phase += self.increment;
        if (self.phase >= 1) {
            self.phase -= 1;
            self.from = self.to;
            self.seed = self.seed *% 1664525 +% 1013904223;
            self.to = @as(f32, @floatFromInt(self.seed >> 8)) / 8388608.0 - 1;
        }
        const t = self.phase * self.phase * (3 - 2 * self.phase);
        const offset = self.from + (self.to - self.from) * t;
        const delay = @as(f32, @floatFromInt(lengths[line])) + self.depth * offset;
        const whole = @floor(delay);
        const index = (cursor -% @as(usize, @intFromFloat(whole))) & ring_mask;
        const a = lines[line][index];
        return a + (lines[line][(index -% 1) & ring_mask] - a) * (delay - whole);
    }
};
var motion: [8]Wander = undefined;

fn samples(seconds: f32, rate: f32, maximum: usize) usize {
    return @intFromFloat(@max(1, @min(@as(f32, @floatFromInt(maximum)), @round(seconds * rate))));
}

export fn init(rate: f32) void {
    dynamics = Dynamics.init(rate);
    lines = @splat(@splat(0));
    low = @splat(0);
    bass = @splat(0);
    cursor = 0;
    for (delay_seconds, 0..) |seconds, i| {
        lengths[i] = samples(seconds, rate, ring_size - 128);
        scatter[i] = .{ .length = samples(scatter_seconds[i], rate, scatter[i].ring.len - 1) };
        const duration = @as(f32, @floatFromInt(lengths[i] + scatter[i].length)) / rate;
        const index: f32 = @floatFromInt(i);
        motion[i] = .{
            .phase = @mod(index * 0.37, 1),
            .increment = (0.41 + 0.079 * index) / rate,
            .depth = @min(120, rate * (0.00081 + 0.000057 * index)),
            .from = @mod(index * 0.83, 2) - 1,
            .to = @mod(0.71 + index * 1.13, 2) - 1,
            .seed = 2654435761 *% @as(u32, @intCast(i + 1)),
        };
        feedback[i] = @exp(-6.907755 * duration / decay_seconds);
    }
    for (&diffusion, [4]f32{ 0.00319, 0.00671, 0.00413, 0.00793 }) |*d, seconds|
        d.* = .{ .length = samples(seconds, rate, d.ring.len - 1) };
    for (&entrance, [2][3]f32{ .{ 0.0211, 0.0337, 0.0383 }, .{ 0.0247, 0.0301, 0.0409 } }) |*e, times| {
        e.* = .{ .taps = undefined };
        for (&e.taps, times) |*tap, seconds| tap.* = samples(seconds, rate, e.ring.len - 1);
    }
    bass_coeff = 1 - @exp(-2.0 * std.math.pi * 100.0 / rate);
    treble_coeff = 1 - @exp(-2.0 * std.math.pi * 3400.0 / rate);
}

export fn tail_frames(rate: f32) usize {
    return @intFromFloat(@ceil(rate * decay_seconds * 1.5));
}

export fn left_buffer() [*]f32 {
    return &left;
}
export fn right_buffer() [*]f32 {
    return &right;
}

fn render(comptime mix: bool, frames: usize) void {
    for (0..frames) |n| {
        bass[0] += bass_coeff * (left[n] - bass[0]);
        bass[1] += bass_coeff * (right[n] - bass[1]);
        entrance[0].write(left[n] - bass[0]);
        entrance[1].write(right[n] - bass[1]);
        const early_l = 0.28 * entrance[0].read(0) + 0.17 * entrance[1].read(1);
        const early_r = 0.28 * entrance[1].read(0) - 0.17 * entrance[0].read(1);
        const l = diffusion[1].tick(diffusion[0].tick(entrance[0].read(2)));
        const r = diffusion[3].tick(diffusion[2].tick(entrance[1].read(2)));
        var tap: [8]f32 = undefined;
        inline for (0..8) |i| tap[i] = scatter[i].tick(motion[i].tap(i));
        const wet_l = return_gain * (early_l + tap[0] + tap[2] - tap[4] - tap[6]);
        const wet_r = return_gain * (early_r + tap[1] - tap[3] - tap[5] + tap[7]);
        if (mix) {
            const pair = dynamics.tick(left[n] + wet_l, right[n] + wet_r);
            left[n] = pair[0];
            right[n] = pair[1];
        } else {
            left[n] = wet_l;
            right[n] = wet_r;
        }
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

export fn process_mix(frames: usize) void {
    render(true, frames);
}

test "a stereo impulse diffuses, decays and clears at common device rates" {
    for ([_]usize{ 44100, 48000, 96000, 192000 }) |rate| {
        init(@floatFromInt(rate));
        var early: f64 = 0;
        var initial_left: f64 = 0;
        var initial_right: f64 = 0;
        var tail: f64 = 0;
        var late: f64 = 0;
        var stereo_difference: f64 = 0;
        for (0..(tail_frames(@floatFromInt(rate)) / block)) |k| {
            left = @splat(0);
            right = @splat(0);
            if (k == 0) left[0] = 1;
            render(false, block);
            for (left, right, 0..) |l, r, i| {
                const t = k * block + i;
                const energy = l * l + r * r;
                try std.testing.expect(std.math.isFinite(energy));
                if (t < rate / 50) try std.testing.expectEqual(@as(f32, 0), energy);
                if (t < rate / 25) {
                    initial_left += l * l;
                    initial_right += r * r;
                }
                if (t < rate / 3) early += energy;
                if (t >= 2 * rate and t < 3 * rate) tail += energy;
                if (t >= 6 * rate) late += energy;
                stereo_difference += (l - r) * (l - r);
            }
        }
        try std.testing.expect(initial_right > 0 and initial_left > initial_right);
        try std.testing.expect(initial_left + initial_right < early * 0.2);
        try std.testing.expect(early > 0.1 and early < 0.22);
        try std.testing.expect(stereo_difference > early * 0.1);
        try std.testing.expect(tail > early * 0.00003 and tail < early * 0.001);
        try std.testing.expect(late < early * 0.0000001);
    }
}
