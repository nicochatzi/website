import type { VoiceControls } from "@/lib/instrumentVoice";
export interface Tuning {
  frequency: number;
  ratio: number;
  depthRatio: number;
  phase: number;
}

interface ScopeExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  view(yaw: number, tilt: number): void;
  begin_motion(
    seed: number,
    x: number,
    y: number,
    z: number,
    pitch: number,
  ): void;
  motion(dt: number): number;
  point_count: () => number;
  trace: (xHz: number, yHz: number, radians: number, zHz: number) => number;
}

export async function loadScope(signal: AbortSignal) {
  const response = await fetch("/apps/lissa.wasm", { signal });
  if (!response.ok) throw new Error("Could not load the scope");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as ScopeExports;
  return {
    beginMotion: wasm.begin_motion,
    motion(dt: number) {
      const [x, y, z, pitch] = new Float32Array(
        wasm.memory.buffer,
        wasm.motion(dt),
        4,
      );
      return { x, y, z, pitch };
    },
    view: wasm.view,
    trace({ frequency, ratio, phase, depthRatio }: Tuning) {
      const offset = wasm.trace(
        frequency,
        frequency * ratio,
        phase,
        frequency * depthRatio,
      );
      return new Float32Array(
        wasm.memory.buffer,
        offset,
        3 * wasm.point_count(),
      );
    },
  };
}

export type Scope = Awaited<ReturnType<typeof loadScope>>;

export function voiceControls({
  frequency,
  ratio,
  depthRatio,
  phase,
}: Tuning): VoiceControls {
  return [frequency, ratio, depthRatio, phase];
}
