interface FlockExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  init: (seed: number) => number;
  count: () => number;
  step: (cohesion: number, x: number, y: number) => void;
  scatter: () => void;
}

export async function loadFlock(signal: AbortSignal) {
  const response = await fetch("/apps/flock.wasm", { signal });
  if (!response.ok) throw new Error("Flock unavailable");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as FlockExports;
  const start = wasm.init(crypto.getRandomValues(new Uint32Array(1))[0]);
  // Interleaved position, velocity and local crowding for each bird.
  const birds = new Float32Array(wasm.memory.buffer, start, wasm.count() * 5);
  return { birds, step: wasm.step, scatter: wasm.scatter };
}

export function drawFlock(
  birds: Float32Array,
  time: number,
  glints: Float64Array,
) {
  const paths = ["", "", ""];
  for (let i = 0; i < birds.length; i += 5) {
    const id = i / 5;
    const x = birds[i] * 400,
      y = birds[i + 1] * 400;
    const angle = Math.atan2(birds[i + 3], birds[i + 2]);
    const dx = Math.cos(angle),
      dy = Math.sin(angle);
    const wing = 3.4 + 2.0 * Math.sin(time * 7.5 + id * 1.7) + (id % 3) * 0.9;
    const point = (along: number, across: number) =>
      `${(x + dx * along - dy * across).toFixed(1)} ${(y + dy * along + dx * across).toFixed(1)}`;
    const layer = glints[id] > time ? 2 : id % 4 === 0 ? 0 : 1;
    paths[layer] +=
      `M${point(-2.9, -wing)}Q${point(1, -wing * 0.62)} ${point(2.4, 0)}Q${point(1, wing * 0.62)} ${point(-2.9, wing)}L${point(-0.6, 0)}Z`;
  }
  return paths;
}
