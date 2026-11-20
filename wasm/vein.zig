//! Branch reinforcement inspired by Physarum transport networks: https://doi.org/10.1016/j.jtbi.2006.07.015

const std = @import("std");

const cols = 24;
const rows = 15;
const mesh = cols * rows;
const root = (rows / 2) * cols + cols / 2;
const foods = 8;
const nodes = mesh + foods;
const max_edges = mesh * 3 + foods;
const Point = extern struct { x: f32, y: f32 };
const Edge = struct { a: usize, b: usize, length: f32, strength: f32 = 0, demand: f32 = 0 };
const Pulse = struct { edge: usize, dest: usize, distance: f32 = 0, energy: f32 };
const Line = extern struct { a: Point, control: Point, b: Point, weight: f32 };
const Spark = extern struct { p: Point, energy: f32 };

var positions: [nodes]Point = undefined;
var active: [foods]bool = undefined;
var edges: [max_edges]Edge = undefined;
var edge_count: usize = 0;
var mesh_edges: usize = 0;
var adjacent: [nodes][6 + foods]usize = undefined;
var degree: [nodes]usize = undefined;
var parent: [mesh]usize = undefined;
var cost: [mesh]f32 = undefined;
var order: [mesh]usize = undefined;
var probes: [16]usize = undefined;
var rng: std.Random.DefaultPrng = .init(0);
var pulses: [192]Pulse = undefined;
var pulse_count: usize = 0;
var lines: [max_edges]Line = undefined;
var sparks: [192]Spark = undefined;
var arrivals: [foods]f32 = undefined;
var beat: f32 = 0;
var tempo: f32 = 51;
var routing: f32 = 0;
var explore: f32 = 0;
var probe_index: usize = 0;

fn number(n: usize) f32 {
    return @floatFromInt(n);
}

fn distance(a: Point, b: Point) f32 {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return @max(0.1, @sqrt(dx * dx + dy * dy));
}

fn between(a: Point, b: Point, t: f32) Point {
    return .{ .x = a.x + (b.x - a.x) * t, .y = a.y + (b.y - a.y) * t };
}

fn connect(a: usize, b: usize) void {
    edges[edge_count] = .{ .a = a, .b = b, .length = distance(positions[a], positions[b]) };
    adjacent[a][degree[a]] = edge_count;
    adjacent[b][degree[b]] = edge_count;
    degree[a] += 1;
    degree[b] += 1;
    edge_count += 1;
}

fn nearest(p: Point) usize {
    var best: usize = 0;
    var shortest: f32 = std.math.inf(f32);
    for (positions[0..mesh], 0..) |site, i| {
        const d = distance(p, site);
        if (d < shortest) {
            best = i;
            shortest = d;
        }
    }
    return best;
}

fn foodPoint(x: f32, y: f32) Point {
    return .{ .x = std.math.clamp(x, 12, 628), .y = std.math.clamp(y, 12, 388) };
}

fn detach(id: usize) void {
    edges[mesh_edges + id].strength = 0;
    var i = pulse_count;
    while (i > 0) {
        i -= 1;
        if (pulses[i].dest != mesh + id) continue;
        pulse_count -= 1;
        pulses[i] = pulses[pulse_count];
    }
}

export fn move_food(id: usize, x: f32, y: f32) void {
    if (id >= foods or !active[id]) return;
    const p = foodPoint(x, y);
    positions[mesh + id] = p;
    const anchor = nearest(p);
    const edge = &edges[mesh_edges + id];
    if (anchor != edge.a) {
        detach(id);
        routing = 0;
    }
    edge.a = anchor;
    edge.length = distance(positions[anchor], p);
}

export fn add_food(x: f32, y: f32) i32 {
    for (&active, 0..) |*used, id| {
        if (used.*) continue;
        used.* = true;
        move_food(id, x, y);
        routing = 0;
        return @intCast(id);
    }
    return -1;
}

export fn remove_food(id: usize) void {
    if (id >= foods) return;
    active[id] = false;
    detach(id);
    routing = 0;
}

// Dijkstra’s shortest paths: https://doi.org/10.1007/BF01386390
fn route() void {
    cost = @splat(std.math.inf(f32));
    cost[root] = 0;
    var visited: [mesh]bool = @splat(false);
    for (&order) |*entry| {
        var u: usize = root;
        var best: f32 = std.math.inf(f32);
        for (cost, visited, 0..) |d, seen, i| {
            if (!seen and d < best) {
                best = d;
                u = i;
            }
        }
        entry.* = u;
        visited[u] = true;
        for (adjacent[u][0..degree[u]]) |id| {
            const e = edges[id];
            const v = if (u == e.a) e.b else e.a;
            const travel = best + e.length / (1 + 0.75 * e.strength);
            if (travel < cost[v]) {
                cost[v] = travel;
                parent[v] = id;
            }
        }
    }
    for (edges[0..edge_count]) |*e| e.demand = 0;
    var flow: [mesh]f32 = @splat(0);
    for (active, 0..) |used, id| {
        if (!used) continue;
        const e = &edges[mesh_edges + id];
        flow[e.a] += 1;
        e.demand = 1;
    }
    for (probes) |site| flow[site] += 0.09;
    for (0..mesh - 1) |i| {
        const u = order[mesh - 1 - i];
        const e = &edges[parent[u]];
        e.demand = flow[u];
        flow[if (e.a == u) e.b else e.a] += flow[u];
    }
}

fn grow(id: usize, from: usize, dt: f32) void {
    const e = &edges[id];
    if (e.demand == 0) return;
    const target = @min(1.25, @sqrt(e.demand) * 0.82);
    const supplied = from == root or edges[parent[from]].strength > 0.20 * @min(1, @sqrt(e.demand));
    if (target > e.strength and supplied) {
        e.strength += (target - e.strength) * @min(1, dt * 4.2);
    } else if (target < e.strength) {
        e.strength += (target - e.strength) * @min(1, dt * 0.85);
    }
}

fn grownFraction(e: Edge) f32 {
    return @min(1, e.strength / @max(0.09, 0.38 * @sqrt(e.demand)));
}

fn outward(id: usize, u: usize) ?usize {
    const e = edges[id];
    const v = if (u == e.a) e.b else e.a;
    if (v < mesh and (v == root or parent[v] != id)) return null;
    if (e.demand <= 0 or grownFraction(e) < 1) return null;
    return v;
}

fn fork(u: usize, energy: f32) void {
    var exits: [6 + foods]usize = undefined;
    var count: usize = 0;
    var weight: f32 = 0;
    for (adjacent[u][0..degree[u]]) |id| {
        if (outward(id, u) == null) continue;
        exits[count] = id;
        count += 1;
        weight += edges[id].demand;
    }
    for (active, 0..) |used, i| {
        const id = mesh_edges + i;
        if (!used or edges[id].a != u or outward(id, u) == null) continue;
        exits[count] = id;
        count += 1;
        weight += edges[id].demand;
    }
    for (exits[0..count]) |id| {
        const share = energy * @sqrt(edges[id].demand / weight);
        if (share < 0.04 or pulse_count == pulses.len) continue;
        pulses[pulse_count] = .{ .edge = id, .dest = outward(id, u).?, .energy = share };
        pulse_count += 1;
    }
}

export fn set_tempo(bpm: f32) void {
    tempo = std.math.clamp(bpm, 24, 180);
}

export fn tick(dt_input: f32) void {
    const dt = std.math.clamp(dt_input, 0, 0.05);
    arrivals = @splat(0);
    explore -= dt;
    if (explore <= 0) {
        probes[probe_index] = rng.random().uintLessThan(usize, mesh);
        probe_index = (probe_index + 1) % probes.len;
        explore = 0.45;
    }
    routing -= dt;
    if (routing <= 0) {
        route();
        routing = 0.28;
    }
    for (order[1..]) |u| {
        const id = parent[u];
        const e = edges[id];
        grow(id, if (e.a == u) e.b else e.a, dt);
    }
    for (edges[0..mesh_edges]) |*e| {
        if (e.demand == 0) e.strength *= 1 - 0.85 * dt;
    }
    for (active, 0..) |used, i| {
        if (used) grow(mesh_edges + i, edges[mesh_edges + i].a, dt);
    }
    beat -= dt * tempo / 60;
    if (beat <= 0) {
        fork(root, 1);
        beat += 1;
    }
    var i = pulse_count;
    while (i > 0) {
        i -= 1;
        const p = &pulses[i];
        const e = edges[p.edge];
        p.distance += dt * (145 + 40 * @min(1, e.strength));
        if (e.strength >= 0.06 and p.distance < e.length) continue;
        const finished = p.*;
        pulse_count -= 1;
        pulses[i] = pulses[pulse_count];
        if (e.strength < 0.06) continue;
        if (finished.dest < mesh) {
            fork(finished.dest, finished.energy);
        } else {
            const food = finished.dest - mesh;
            if (active[food]) arrivals[food] = @max(arrivals[food], finished.energy);
        }
    }
}

export fn init(seed: u32) void {
    rng = .init(seed);
    active = @splat(false);
    degree = @splat(0);
    pulse_count = 0;
    edge_count = 0;
    beat = 0;
    tempo = 51;
    explore = 0;
    routing = 0;
    probe_index = 0;
    for (0..mesh) |i| {
        const col = i % cols;
        const row = i / cols;
        const jitter = rng.random();
        positions[i] = .{ .x = 14 + 26 * (number(col) + 0.5 * number(row % 2) + 0.72 * (jitter.float(f32) - 0.5)), .y = 16 + 26 * (number(row) + 0.72 * (jitter.float(f32) - 0.5)) };
        if (col > 0) connect(i - 1, i);
        if (row > 0) {
            connect(i - cols, i);
            if (row % 2 == 1 and col + 1 < cols) connect(i - cols + 1, i);
            if (row % 2 == 0 and col > 0) connect(i - cols - 1, i);
        }
    }
    mesh_edges = edge_count;
    for (0..foods) |i| {
        edges[edge_count] = .{ .a = root, .b = mesh + i, .length = 1 };
        edge_count += 1;
    }
    for (&probes) |*site| site.* = rng.random().uintLessThan(usize, mesh);
    _ = add_food(110, 122);
    _ = add_food(495, 82);
    _ = add_food(422, 318);
    for (0..95) |_| tick(1.0 / 60.0);
}

fn curve(e: Edge, dest: usize, t: f32) Line {
    const u = if (dest == e.a) e.b else e.a;
    const start = positions[u];
    const end = positions[dest];
    var control = between(start, end, 0.5);
    if (u != root and u < mesh) {
        const incoming = edges[parent[u]];
        const prior = positions[if (u == incoming.a) incoming.b else incoming.a];
        const tangent = between(start, prior, -0.43 * e.length / incoming.length);
        control = between(control, tangent, 0.65);
    }
    const c = between(start, control, t);
    return .{ .a = start, .control = c, .b = between(c, between(control, end, t), t), .weight = e.strength };
}

export fn line_count() usize {
    var count: usize = 0;
    for (edges[0..edge_count]) |e| {
        if (e.strength < 0.018) continue;
        const flip = e.b < mesh and cost[e.a] > cost[e.b];
        lines[count] = curve(e, if (flip) e.a else e.b, grownFraction(e));
        count += 1;
    }
    return count;
}

export fn spark_count() usize {
    for (pulses[0..pulse_count], 0..) |p, i| {
        const e = edges[p.edge];
        sparks[i] = .{ .p = curve(e, p.dest, @min(1, p.distance / e.length)).b, .energy = p.energy };
    }
    return pulse_count;
}

export fn line_buffer() [*]const Line {
    return &lines;
}
export fn spark_buffer() [*]const Spark {
    return &sparks;
}
export fn food_buffer() [*]const Point {
    return positions[mesh..].ptr;
}
export fn source() *const Point {
    return &positions[root];
}
export fn hits() [*]const f32 {
    return &arrivals;
}
export fn food_mask() u32 {
    var mask: u32 = 0;
    for (active, 0..) |used, i| {
        if (used) mask |= @as(u32, 1) << @intCast(i);
    }
    return mask;
}

const sample_rate = 32000;
const note_frames = sample_rate * 2;
var note: [note_frames]f32 = undefined;
const pitches = [_]f32{ 146.832, 220, 329.628, 246.942, 369.994, 195.998, 293.665, 440 };

export fn note_buffer(id: usize) [*]const f32 {
    const hz = pitches[id % pitches.len];
    @memset(&note, 0);
    for ([_]f32{ 1, 2.006, 3.01, 4.19, 6.27 }, [_]f32{ 0.31, 0.083, 0.052, 0.025, 0.009 }, [_]f32{ 0.42, 0.22, 0.17, 0.10, 0.062 }) |ratio, gain, decay| {
        const angle = 2 * std.math.pi * @as(f64, hz * ratio) / sample_rate;
        const radius = @exp(-1 / (@as(f64, decay) * sample_rate));
        const a = 2 * radius * @cos(angle);
        const b = radius * radius;
        var previous: f64 = 0;
        var current: f64 = gain * @sin(angle);
        for (&note) |*sample| {
            sample.* += @floatCast(current);
            const next = a * current - b * previous;
            previous = current;
            current = next;
        }
    }
    for (&note, 0..) |*sample, i| {
        const attack = @min(1, number(i) / 320);
        const release = @min(1, number(note_frames - 1 - i) / 640);
        sample.* *= attack * attack * (3 - 2 * attack) * release;
    }
    return &note;
}

export fn audio_rate() usize {
    return sample_rate;
}
export fn audio_frames() usize {
    return note_frames;
}

test "food grows a conducting branch, receives pulses, and loses its old route" {
    init(42);
    var heard: [foods]bool = @splat(false);
    const old = edges[mesh_edges].a;
    for (0..360) |_| {
        tick(1.0 / 60.0);
        for (&heard, arrivals) |*h, energy| h.* = h.* or energy > 0;
    }
    for (heard[0..3]) |h| try std.testing.expect(h);
    const old_edge = parent[old];
    const old_strength = edges[old_edge].strength;
    move_food(0, 610, 365);
    var returned = false;
    for (0..540) |_| {
        tick(1.0 / 60.0);
        returned = returned or arrivals[0] > 0;
    }
    try std.testing.expect(returned and edges[old_edge].strength < old_strength * 0.65);
    remove_food(0);
    for (0..240) |_| {
        tick(1.0 / 60.0);
        try std.testing.expectEqual(@as(f32, 0), arrivals[0]);
    }
    for (0..foods - 2) |_| try std.testing.expect(add_food(250, 140) >= 0);
    try std.testing.expectEqual(@as(i32, -1), add_food(90, 380));
}

test "longer routes delay the audible arrival" {
    var times: [2]f32 = undefined;
    for ([_]f32{ 352, 610 }, 0..) |x, i| {
        init(13);
        for (0..3) |id| remove_food(id);
        const id: usize = @intCast(add_food(x, positions[root].y));
        for (0..360) |_| tick(1.0 / 60.0);
        pulse_count = 0;
        beat = 0;
        var t: usize = 0;
        while (t < 240) : (t += 1) {
            tick(1.0 / 60.0);
            if (arrivals[id] > 0) break;
        }
        try std.testing.expect(t < 240);
        times[i] = number(t) / 60;
    }
    try std.testing.expect(times[1] > times[0] + 1);
}

fn ticksUntilArrival(food: usize) !usize {
    for (1..181) |n| {
        tick(1.0 / 60.0);
        if (arrivals[food] > 0) return n;
    }
    return error.NoArrival;
}

test "changing pulse tempo preserves the fraction of the beat still to play" {
    init(42);
    for (0..3) |id| remove_food(id);
    const food: usize = @intCast(add_food(positions[root].x, positions[root].y));
    set_tempo(24);
    _ = try ticksUntilArrival(food);
    const slow = try ticksUntilArrival(food);
    try std.testing.expect(slow >= 149 and slow <= 151);

    for (0..75) |_| tick(1.0 / 60.0);
    set_tempo(180);
    const half_beat = try ticksUntilArrival(food);
    try std.testing.expect(half_beat >= 9 and half_beat <= 11);
    const fast = try ticksUntilArrival(food);
    try std.testing.expect(fast >= 19 and fast <= 21);
}
