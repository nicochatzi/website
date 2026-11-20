import { readChord } from "./chords";

export type Point = { x: number; y: number };

interface PondExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  width(): number;
  height(): number;
  init(seed: number): void;
  clear(): void;
  drop(x: number, y: number, strength: number): void;
  wake(x0: number, y0: number, x1: number, y1: number): number;
  tick(damping: number, alive: boolean): number;
  move_pickup(index: number, x: number, y: number): void;
  strikes(): number;
  swimmer_position(): number;
  chord(): number;
  chord_revision(): number;
  set_chord(root: number, voicing: number): void;
  contour_buffer(): number;
  contour(level: number): number;
  pulse_buffer(): number;
  excite(hz: number, rate: number, crest: number): number;
}

export async function loadPond(signal: AbortSignal) {
  const response = await fetch("/apps/pond.wasm", { signal });
  if (!response.ok) throw new Error("Pond unavailable");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as PondExports;
  wasm.init(crypto.getRandomValues(new Uint32Array(1))[0]);
  const buffer = wasm.memory.buffer;
  const chord = new Uint8Array(buffer, wasm.chord(), 8);
  const segments = wasm.contour_buffer();
  const mallet = wasm.pulse_buffer();
  return {
    wasm,
    width: wasm.width(),
    height: wasm.height(),
    swimmer: new Float32Array(buffer, wasm.swimmer_position(), 2),
    strikes: new Float32Array(buffer, wasm.strikes(), 3),
    chord: () => readChord(chord),
    contour: (level: number) =>
      new Float32Array(buffer, segments, 4 * wasm.contour(level)),
    pulse: (hz: number, rate: number, crest: number) =>
      new Float32Array(buffer, mallet, wasm.excite(hz, rate, crest)),
  };
}

export type PondEngine = Awaited<ReturnType<typeof loadPond>>;
