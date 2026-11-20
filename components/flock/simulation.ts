interface FlockExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  init: (seed: number) => number;
  count: () => number;
  step: (cohesion: number, x: number, y: number) => void;
  wings(seconds: number): number;
  next_grain(size: number, density: number, sampleSeconds: number): number;
  scatter: () => void;
}

export async function loadFlock(signal: AbortSignal) {
  const response = await fetch("/apps/flock.wasm", { signal });
  if (!response.ok) throw new Error("Flock unavailable");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as FlockExports;
  wasm.init(crypto.getRandomValues(new Uint32Array(1))[0]);
  const count = wasm.count();
  return {
    count,
    step: wasm.step,
    scatter: wasm.scatter,
    nextGrain(size: number, density: number, seconds: number) {
      return new Float32Array(
        wasm.memory.buffer,
        wasm.next_grain(size, density, seconds),
        7,
      );
    },
    paths(time: number, glints: Float64Array) {
      const vertices = new Float32Array(
        wasm.memory.buffer,
        wasm.wings(time),
        count * 12,
      );
      const paths = ["", "", ""];
      for (let id = 0; id < count; id++) {
        const point = (i: number) => {
          const p = id * 12 + i * 2;
          return `${vertices[p].toFixed(1)} ${vertices[p + 1].toFixed(1)}`;
        };
        const layer = glints[id] > time ? 2 : id % 4 === 0 ? 0 : 1;
        paths[layer] +=
          `M${point(0)}Q${point(1)} ${point(2)}Q${point(3)} ${point(4)}L${point(5)}Z`;
      }
      return paths;
    },
  };
}

export type FlockEngine = Awaited<ReturnType<typeof loadFlock>>;
