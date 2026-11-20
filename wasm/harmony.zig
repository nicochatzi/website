const std = @import("std");

const intervals = [_][3]u8{
    .{ 0, 7, 12 }, .{ 0, 4, 7 },  .{ 0, 3, 7 },  .{ 0, 2, 7 },  .{ 0, 5, 7 },
    .{ 0, 3, 6 },  .{ 0, 4, 8 },  .{ 0, 4, 9 },  .{ 0, 3, 9 },  .{ 0, 4, 11 },
    .{ 0, 4, 10 }, .{ 0, 3, 10 }, .{ 0, 3, 11 }, .{ 0, 4, 14 }, .{ 0, 3, 14 },
    .{ 0, 7, 16 }, .{ 0, 7, 15 }, .{ 0, 5, 10 }, .{ 0, 7, 14 }, .{ 0, 12, 24 },
};

pub const Chord = extern struct {
    root: u8,
    shape: u8,
    notes: [3]u8,
    degrees: [3]u8,

    fn voiced(root: u8, shape: u8, inversion: usize, bass: u8) Chord {
        var chord = Chord{ .root = root, .shape = shape, .notes = undefined, .degrees = undefined };
        const tones = intervals[shape];
        const span = (tones[2] / 12 + 1) * 12;
        for (0..3) |voice| {
            const index = inversion + voice;
            const degree = tones[index % 3];
            const lifted = if (index >= 3) degree + span else degree;
            chord.notes[voice] = bass + (lifted - tones[inversion]);
            chord.degrees[voice] = degree;
        }
        return chord;
    }
};

pub const Walk = struct {
    chord: Chord = Chord.voiced(7, 0, 0, 55),
    history: [8][3]u8 = @splat(.{ 0, 0, 0 }),
    random: std.Random.DefaultPrng,

    pub fn select(self: *Walk, root: u8, shape: u8) void {
        self.chord = Chord.voiced(root, shape, 0, 48 + root);
        self.history = @splat(.{ 0, 0, 0 });
    }

    pub fn advance(self: *Walk) void {
        const before = self.chord;
        var winner = before;
        var best: f32 = -1000;
        for (intervals, 0..) |tones, shape| {
            for (0..3) |inversion| {
                for (43..69) |bass| {
                    const root: u8 = @intCast((bass + 24 - tones[inversion]) % 12);
                    const next = Chord.voiced(root, @intCast(shape), inversion, @intCast(bass));
                    if (next.notes[2] > 84) continue;
                    var changes: usize = 0;
                    var leap: u8 = 0;
                    for (before.notes, next.notes) |a, b| {
                        if (a == b) continue;
                        changes += 1;
                        leap = @max(a, b) - @min(a, b);
                    }
                    if (changes != 1 or leap > 7) continue;
                    var score = self.random.random().float(f32) * 4 - @as(f32, @floatFromInt(leap)) * 0.8;
                    if (next.root != before.root) score += 0.65;
                    for (self.history, 0..) |old, age| {
                        if (std.mem.eql(u8, &old, &next.notes)) score -= @floatFromInt(12 - age);
                    }
                    if (score > best) {
                        best = score;
                        winner = next;
                    }
                }
            }
        }
        @memmove(self.history[1..], self.history[0 .. self.history.len - 1]);
        self.history[0] = before.notes;
        self.chord = winner;
    }
};

test "every starting chord can walk one pickup at a time, keeping both common tones in register" {
    for (0..12) |root| {
        for (0..intervals.len) |shape| {
            var walk = Walk{ .random = .init(root * intervals.len + shape) };
            walk.select(@intCast(root), @intCast(shape));
            var changed_root = false;
            var inverted = false;
            for (0..32) |_| {
                const before = walk.chord;
                walk.advance();
                var changes: usize = 0;
                for (before.notes, walk.chord.notes, walk.chord.degrees) |a, b, degree| {
                    if (a != b) changes += 1;
                    try std.testing.expectEqual((walk.chord.root + degree) % 12, b % 12);
                }
                try std.testing.expectEqual(@as(usize, 1), changes);
                changed_root = changed_root or walk.chord.root != root;
                inverted = inverted or walk.chord.notes[0] % 12 != walk.chord.root;
            }
            try std.testing.expect(changed_root and inverted);
        }
    }
}
