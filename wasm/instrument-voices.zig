const std = @import("std");
const tau = 2 * std.math.pi;
const table_size = 2048;
const table = blk: {
    @setEvalBranchQuota(20000);
    var samples: [table_size]f32 = undefined;
    for (&samples, 0..) |*s, i| s.* = @sin(@as(f32, @floatFromInt(i)) * tau / table_size);
    break :blk samples;
};

fn wrap(p: f32) f32 {
    return p - @floor(p);
}

fn sine(cycles: f32) f32 {
    const pos = wrap(cycles) * table_size;
    const i: usize = @intFromFloat(pos);
    const a = table[i % table_size];
    return a + (table[(i + 1) % table_size] - a) * (pos - @floor(pos));
}

const Stereo = @Vector(2, f32);
const Controls = @Vector(4, f32);
const block = 128;
var rate: f32 = 48000;
var plate: bool = false;
var parameters: Controls = undefined;
var goal: Controls = undefined;
var phase: [3]f32 = undefined;
var left: [block]f32 = undefined;
var right: [block]f32 = undefined;

const Mode = struct { ratio: f32, decay: f32, gain: f32, pan: f32 };
const modes = [_]Mode{
    .{ .ratio = 1, .decay = 1.7, .gain = 0.065, .pan = 0.44 },
    .{ .ratio = 1.004, .decay = 1.3, .gain = 0.041, .pan = 0.68 },
    .{ .ratio = 1.508, .decay = 1.15, .gain = 0.028, .pan = 0.22 },
    .{ .ratio = 2.376, .decay = 1.42, .gain = 0.035, .pan = 0.72 },
    .{ .ratio = 2.393, .decay = 0.91, .gain = 0.023, .pan = 0.28 },
    .{ .ratio = 3.87, .decay = 0.86, .gain = 0.022, .pan = 0.38 },
    .{ .ratio = 5.32, .decay = 0.55, .gain = 0.012, .pan = 0.64 },
    .{ .ratio = 7.13, .decay = 0.37, .gain = 0.009, .pan = 0.31 },
};
var displacement: [modes.len]f32 = undefined;
var velocity: [modes.len]f32 = undefined;
var losses: [modes.len]f32 = undefined;
var noise_gain: [modes.len]f32 = undefined;
var seed: u32 = 1;
var roughness: f32 = 0;

export fn init(sample_rate: f32, is_plate: bool, hz: f32, ratio: f32, depth: f32, phase_offset: f32) void {
    rate = sample_rate;
    plate = is_plate;
    tune(hz, ratio, depth, phase_offset);
    parameters = goal;
    phase = .{ 0, 0.21, 0.38 };
    displacement = @splat(0);
    velocity = @splat(0);
    seed = 631;
    roughness = 0;
    for (modes, 0..) |m, i| {
        losses[i] = @exp(-1 / (m.decay * rate));
        noise_gain[i] = @sqrt(1 - losses[i] * losses[i]);
    }
}

export fn tune(hz: f32, ratio: f32, depth: f32, phase_offset: f32) void {
    goal = .{ hz, ratio, depth, phase_offset };
}

fn noise() f32 {
    seed = seed *% 1664525 +% 1013904223;
    return @as(f32, @floatFromInt(seed >> 8)) / 8388608 - 1;
}

fn bowedPlate(frames: usize) void {
    const hz = parameters[0];
    var cosines: [modes.len]f32 = undefined;
    var sines: [modes.len]f32 = undefined;
    for (modes, 0..) |m, i| {
        const angle = tau * m.ratio * hz / rate;
        cosines[i] = @cos(angle) * losses[i];
        sines[i] = @sin(angle) * losses[i];
    }
    for (0..frames) |n| {
        const pressure = 0.72 + 0.22 * sine(phase[1]) + 0.06 * sine(phase[2]);
        const grain = noise();
        roughness += 0.06 * (grain - roughness);
        const bow = sine(phase[0] + 0.055 * pressure * sine(phase[0] * 2));
        const contact = roughness * (0.24 + 0.42 * @abs(bow)) * pressure;
        var out: Stereo = @splat(0.053 * pressure * bow);
        for (modes, 0..) |m, i| {
            const old = displacement[i];
            displacement[i] = cosines[i] * old + sines[i] * velocity[i];
            velocity[i] = cosines[i] * velocity[i] - sines[i] * old +
                contact * noise_gain[i] * 1.65 + bow * (1 - losses[i]);
            const sample = m.gain * displacement[i];
            out += .{ sample * (1 - m.pan), sample * m.pan };
        }
        left[n] = out[0];
        right[n] = out[1];
        phase[0] = wrap(phase[0] + hz * (1 + 0.00095 * sine(phase[2])) / rate);
        phase[1] = wrap(phase[1] + 0.73 / rate);
        phase[2] = wrap(phase[2] + 3.71 / rate);
    }
}

fn formant(phase_in: f32, harmonic: f32) f32 {
    const p = wrap(phase_in);
    const window = 0.5 - 0.5 * sine(p + 0.25);
    return window * window * sine(harmonic * (p - 0.5));
}

fn ribbon(frames: usize) void {
    const hz = parameters[0];
    const ratio = parameters[1];
    const depth = parameters[2];
    const offset = parameters[3] / tau;
    const first = (460 + 530 * parameters[3] / std.math.pi) / hz;
    const second = (1250 + depth * 265) / hz;
    for (0..frames) |n| {
        const y = sine(phase[1] + offset);
        const z = sine(phase[2]);
        const bend = phase[0] + 0.105 * y + 0.038 * z;
        const body = 0.073 * sine(bend) + 0.024 * y;
        const vowel = formant(phase[0] + 0.034 * z, first);
        const edge = formant(phase[0] - 0.047 * z, second);
        left[n] = body + 0.061 * vowel + 0.029 * edge + 0.025 * sine(bend * 2 + 0.09 * z);
        right[n] = body + 0.046 * vowel + 0.043 * edge + 0.025 * sine(bend * 2 - 0.11 * z + 0.09);
        phase[0] = wrap(phase[0] + hz / rate);
        phase[1] = wrap(phase[1] + hz * ratio / rate);
        phase[2] = wrap(phase[2] + hz * depth / rate);
    }
}

export fn render(frames: usize) void {
    const mix: Controls = @splat(1 - @exp(-@as(f32, @floatFromInt(frames)) / (rate * 0.018)));
    parameters += (goal - parameters) * mix;
    if (plate) bowedPlate(frames) else ribbon(frames);
}

export fn left_buffer() [*]const f32 {
    return &left;
}
export fn right_buffer() [*]const f32 {
    return &right;
}

test "both voices make bounded stereo signals while sweeping controls" {
    for ([_]f32{ 44100, 48000, 96000 }) |sample_rate| {
        for ([_]bool{ false, true }) |is_plate| {
            init(sample_rate, is_plate, 220, 1.5, 0.75, 1.57);
            var energy: f32 = 0;
            var width: f32 = 0;
            for (0..400) |i| {
                if (i == 80) tune(440, 3, 3, std.math.pi);
                if (i == 250) tune(110, 0.5, 0.5, 0);
                render(block);
                for (left, right) |l, r| {
                    try std.testing.expect(@abs(l) < 0.4 and @abs(r) < 0.4);
                    energy += l * l;
                    width += @abs(l - r);
                }
            }
            try std.testing.expect(energy > 5 and width > 1);
        }
    }
}
