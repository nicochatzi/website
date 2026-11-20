//! Oscillator waveforms and filter voicing in the Jupiter-6: https://synthfool.com/docs/Roland/Roland_Jupiter6/Roland_Jupiter_6_Owners_Manual.pdf

const std = @import("std");

const table_len = 512;
const Table = [table_len]f32;
const block = 128;
const edges = [_]f32{ 90, 129, 168, 210, 290, 365, 470, 680, 950, 1500, 2400 };
const bands = edges.len + 1;
const Note = struct { midi: u8, level: f32, pan: f32 };
const voicing = [_]Note{
    .{ .midi = 38, .level = 0.054, .pan = 0.48 },
    .{ .midi = 45, .level = 0.042, .pan = 0.32 },
    .{ .midi = 54, .level = 0.035, .pan = 0.70 },
    .{ .midi = 64, .level = 0.030, .pan = 0.26 },
    .{ .midi = 68, .level = 0.026, .pan = 0.63 },
};
const sine: Table = blk: {
    @setEvalBranchQuota(5000);
    var values: Table = undefined;
    for (&values, 0..) |*v, i| v.* = @sin(2.0 * std.math.pi * @as(f32, @floatFromInt(i)) / table_len);
    break :blk values;
};

const LowPass = struct {
    s1: f32 = 0,
    s2: f32 = 0,

    fn tick(f: *LowPass, x: f32, g: f32, a: f32) f32 {
        const v1 = (f.s1 + g * (x - f.s2)) * a;
        const v2 = f.s2 + g * v1;
        f.s1 = 2 * v1 - f.s1;
        f.s2 = 2 * v2 - f.s2;
        return v2;
    }
};

const Voice = struct {
    phase_a: f32,
    phase_b: f32,
    filters: [2]LowPass = .{ .{}, .{} },
    partials: [bands]Table = @splat(@splat(0)),
    waves: [2]Table = @splat(@splat(0)),
};
var voices: [voicing.len]Voice = undefined;
var rate: f32 = 48000;
var time: f64 = 0;
var target: [bands]f32 = @splat(0);
var applied: [bands]f32 = @splat(0);
var current: usize = 0;
var blend: f32 = 1;
var left: [block]f32 = undefined;
var right: [block]f32 = undefined;

fn frequency(i: usize) f32 {
    return 440 * @exp2((@as(f32, @floatFromInt(voicing[i].midi)) - 69) / 12);
}

export fn init(sample_rate: f32) void {
    rate = sample_rate;
    time = 0;
    current = 0;
    blend = 1;
    applied = @splat(0);
    target = @splat(0);
    for (&voices, 0..) |*v, i| {
        const seed: f32 = @floatFromInt(i);
        v.* = .{ .phase_a = 0.09 + seed * 0.21, .phase_b = 0.84 - seed * 0.19 };
        for (1..49) |n| {
            const h: f32 = @floatFromInt(n);
            const hz = frequency(i) * h;
            if (hz > @min(rate * 0.42, 7200)) break;
            var band: usize = 0;
            while (band < edges.len and hz >= edges[band]) : (band += 1) {}
            const rolloff = hz / 3600;
            const gain = 1 / (h * (1 + rolloff * rolloff));
            for (&v.partials[band], 0..) |*sample, j| sample.* += gain * sine[(j * n) % table_len];
        }
    }
}

fn prepareWaves() void {
    if (blend < 1 or std.mem.eql(f32, &target, &applied)) return;
    current = 1 - current;
    for (&voices) |*v| {
        const next = &v.waves[current];
        next.* = @splat(0);
        for (&v.partials, target) |*partial, gain| {
            if (gain == 0) continue;
            for (next, partial) |*sample, p| sample.* += gain * p;
        }
    }
    applied = target;
    blend = 0;
}

fn lookup(wave: *const Table, phase: f32) f32 {
    const pos = phase * table_len;
    const i: usize = @intFromFloat(pos);
    const a = wave[i % table_len];
    return a + (wave[(i + 1) % table_len] - a) * (pos - @floor(pos));
}

fn oscillators(wave: *const Table, a: f32, b: f32, duty: f32) f32 {
    return 0.64 * lookup(wave, a) + 0.36 * (lookup(wave, b) - lookup(wave, b + duty));
}

fn lfo(seconds: f64, hz: f32, phase: f32) f32 {
    return @floatCast(@sin(seconds * (2.0 * std.math.pi) * hz + phase));
}

export fn render(frames: usize) void {
    prepareWaves();
    const mix_step = 1 / (rate * 0.018);
    @memset(left[0..frames], 0);
    @memset(right[0..frames], 0);
    for (&voices, 0..) |*v, i| {
        const seed: f32 = @floatFromInt(i);
        const breath = lfo(time, 0.08 + seed * 0.013, seed * 1.7);
        const drift = lfo(time, 0.16 + seed * 0.021, 3.2 + seed) + 0.4 * lfo(time, 0.32, seed);
        const step = frequency(i) / rate;
        const step_a = step * (1 + 0.00013 * breath);
        const step_b = step * (1 + (if (i % 2 == 0) @as(f32, -0.0014) else 0.0014) + drift * 0.00065);
        const duty = 0.39 + seed * 0.013 + 0.085 * lfo(time, 0.115 + seed * 0.019, seed * 2.3);
        const bloom: f32 = @floatCast(1 - @exp(-time * 1.8));
        const cutoff = @min(rate * 0.38, 820 + seed * 85 + 640 * bloom + 230 * breath);
        const g = @tan(std.math.pi * cutoff / rate);
        const a1 = 1 / (1 + g * (g + 1.65));
        const a2 = 1 / (1 + g * (g + 1.06));
        const note = voicing[i];
        const gl = note.level * @sqrt(1 - note.pan);
        const gr = note.level * @sqrt(note.pan);
        var mix = blend;
        for (0..frames) |n| {
            var x = oscillators(&v.waves[current], v.phase_a, v.phase_b, duty);
            if (mix < 1) {
                const prior = oscillators(&v.waves[1 - current], v.phase_a, v.phase_b, duty);
                x = prior + mix * (x - prior);
                mix = @min(1, mix + mix_step);
            }
            v.phase_a += step_a;
            v.phase_b += step_b;
            v.phase_a -= @floor(v.phase_a);
            v.phase_b -= @floor(v.phase_b);
            const drive = x / (1 + 0.22 * @abs(x));
            const y = v.filters[1].tick(v.filters[0].tick(drive, g, a1), g, a2);
            left[n] += gl * y;
            right[n] += gr * y;
        }
    }
    const count: f32 = @floatFromInt(frames);
    blend = @min(1, blend + count * mix_step);
    time += @as(f64, count) / rate;
}

export fn light_buffer() [*]f32 {
    return &target;
}
export fn left_buffer() [*]const f32 {
    return &left;
}
export fn right_buffer() [*]const f32 {
    return &right;
}

test "open D Lydian voicing, independently audible bands and silence after totality" {
    for ([_]f32{ 73.41619, 110, 184.99721, 329.62756, 415.30470 }, 0..) |hz, i|
        try std.testing.expectApproxEqAbs(hz, frequency(i), 0.0001);
    for ([_]f32{ 44100, 48000, 96000 }) |sample_rate| {
        init(sample_rate);
        for (0..bands) |band| {
            target = @splat(0);
            target[band] = 1;
            for (0..32) |_| render(block);
            var energy: f64 = 0;
            for (0..32) |_| {
                render(block);
                for (left, right) |l, r| energy += l * l + r * r;
            }
            try std.testing.expect(energy > 1e-9);
        }
        target = @splat(1);
        var peak: f32 = 0;
        for (0..500) |_| {
            render(block);
            for (left, right) |l, r| peak = @max(peak, @abs(l), @abs(r));
        }
        try std.testing.expect(peak > 0.04 and peak < 0.30);
        target = @splat(0);
        for (0..128) |_| render(block);
        for (left, right) |l, r| try std.testing.expect(@max(@abs(l), @abs(r)) < 1e-7);
    }
}
