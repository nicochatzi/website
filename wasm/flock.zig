const Vec2 = @Vector(2, f32);

const Bird = extern struct {
    x: f32,
    y: f32,
    vx: f32,
    vy: f32,
    crowd: f32,

    fn position(self: Bird) Vec2 {
        return .{ self.x, self.y };
    }

    fn velocity(self: Bird) Vec2 {
        return .{ self.vx, self.vy };
    }
};

const field_width = 1.6;
const time_step = 1.0 / 60.0;
const neighbor_radius = 0.19;
const separation_radius = 0.056;
const full_turn = 6.283185;

var birds: [80]Bird = undefined;
var seed: u32 = 0;
var time: f32 = 0;

fn scale(vector: Vec2, factor: f32) Vec2 {
    return vector * @as(Vec2, @splat(factor));
}

fn magnitude(vector: Vec2) f32 {
    return @sqrt(@reduce(.Add, vector * vector));
}

fn random() f32 {
    seed = seed *% 1664525 +% 1013904223;
    return @as(f32, @floatFromInt(seed >> 8)) / 16777216.0;
}

export fn init(value: u32) [*]const Bird {
    seed = value;
    time = 0;
    for (&birds) |*bird| {
        const angle = random() * full_turn;
        bird.* = .{
            .x = 0.15 + random() * 1.3,
            .y = 0.12 + random() * 0.76,
            .vx = 0.12 * @cos(angle),
            .vy = 0.12 * @sin(angle),
            .crowd = 0,
        };
    }
    return &birds;
}

export fn count() u32 {
    return birds.len;
}

export fn scatter() void {
    for (&birds) |*bird| {
        const angle = random() * full_turn;
        bird.vx += @cos(angle) * 0.42;
        bird.vy += @sin(angle) * 0.42;
    }
}

const Neighborhood = struct {
    force: Vec2,
    crowd: f32,
};

fn neighborhood(snapshot: []const Bird, index: usize, cohesion: f32) Neighborhood {
    const bird = snapshot[index];
    var offsets: Vec2 = @splat(0);
    var headings: Vec2 = @splat(0);
    var separation: Vec2 = @splat(0);
    var total_weight: f32 = 0;

    for (snapshot, 0..) |other, other_index| {
        if (other_index == index) continue;
        const offset = other.position() - bird.position();
        const distance_squared = @reduce(.Add, offset * offset);
        if (distance_squared >= neighbor_radius * neighbor_radius) continue;

        const distance = @sqrt(@max(distance_squared, 0.0000001));
        const weight = 1 - distance / neighbor_radius;
        offsets += scale(offset, weight);
        headings += scale(other.velocity() - bird.velocity(), weight);
        separation -= scale(offset, @max(0, 1 - distance / separation_radius) / distance);
        total_weight += weight;
    }

    const normalization = 1 / @max(1, total_weight);
    return .{
        .force = scale(offsets, normalization * (0.7 + 5 * cohesion)) +
            scale(headings, normalization * 1.5) +
            scale(separation, 0.53),
        .crowd = @min(1, total_weight / 6),
    };
}

fn edgeForce(coordinate: f32, extent: f32) f32 {
    const margin = 0.15;
    return @max(0, margin - coordinate) - @max(0, coordinate - (extent - margin));
}

export fn step(cohesion: f32, target_x: f32, target_y: f32) void {
    const snapshot = birds;
    time += time_step;
    const roost: Vec2 = .{
        0.8 + 0.48 * @cos(time * 0.31),
        0.5 + 0.28 * @sin(time * 0.43),
    };
    for (&birds, snapshot, 0..) |*bird, previous, index| {
        const position = previous.position();
        const neighbors = neighborhood(&snapshot, index, cohesion);
        var force = neighbors.force + scale(roost - position, 0.09);
        if (target_x >= 0) force += scale(Vec2{ target_x, target_y } - position, 1.4);
        force += scale(Vec2{ edgeForce(position[0], field_width), edgeForce(position[1], 1) }, 7);

        const phase: f32 = @floatFromInt(index);
        force += Vec2{ 0.028 * @sin(time * 0.8 + phase), 0.028 * @cos(time * 0.7 + phase) };
        var velocity = previous.velocity() + scale(force, time_step / @max(1, magnitude(force) / 1.1));
        const speed = @max(magnitude(velocity), 0.00001);
        const cruise = 0.12 + 0.04 * @sin(phase * 1.8);
        velocity = scale(velocity, (speed + (cruise - speed) * time_step * 1.6) / speed);

        const next = position + scale(velocity, time_step);
        bird.* = .{
            .x = @min(field_width, @max(0, next[0])),
            .y = @min(1, @max(0, next[1])),
            .vx = if (next[0] < 0 or next[0] > field_width) -velocity[0] else velocity[0],
            .vy = if (next[1] < 0 or next[1] > 1) -velocity[1] else velocity[1],
            .crowd = neighbors.crowd,
        };
    }
}
