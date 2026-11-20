export const ratios = [
  [1, 1],
  [5, 4],
  [4, 3],
  [3, 2],
  [5, 3],
  [2, 1],
  [3, 1],
] as const;

interface ScopeExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  point_count: () => number;
  trace: (xCycles: number, yCycles: number, radians: number) => number;
}

export async function loadScope(signal: AbortSignal) {
  const response = await fetch("/apps/lissajous.wasm", { signal });
  if (!response.ok) throw new Error("Could not load the scope");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as ScopeExports;

  return (ratio: number, degrees: number) => {
    const [yCycles, xCycles] = ratios[ratio];
    const offset = wasm.trace(xCycles, yCycles, (degrees * Math.PI) / 180);
    return new Float32Array(
      wasm.memory.buffer,
      offset,
      2 * wasm.point_count(),
    ).slice();
  };
}

export class ScopeAudio {
  readonly context = new AudioContext();
  private master = this.context.createGain();
  private epoch = this.context.currentTime;
  private voice?: { source: AudioBufferSourceNode; gain: GainNode };

  constructor() {
    this.master.gain.value = 0.08;
    this.master.connect(this.context.destination);
  }

  play(points: Float32Array, cycles: number) {
    const ctx = this.context;
    const buffer = ctx.createBuffer(2, points.length / 2, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) {
      const x = points[i * 2];
      const y = points[i * 2 + 1];
      left[i] = 0.7 * x + 0.3 * y;
      right[i] = 0.3 * x + 0.7 * y;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const loopsPerSecond = 220 / cycles;
    source.playbackRate.value = buffer.duration * loopsPerSecond;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(this.master);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };

    // Keep the X tone in phase and crossfade to the new curve while dragging.
    const now = ctx.currentTime;
    this.fadeVoice(now);
    source.start(
      now,
      (((now - this.epoch) * loopsPerSecond) % 1) * buffer.duration,
    );
    gain.gain.setTargetAtTime(1, now, 0.015);
    this.voice = { source, gain };
  }

  private fadeVoice(now: number) {
    if (!this.voice) return;
    this.voice.gain.gain.setTargetAtTime(0, now, 0.015);
    this.voice.source.stop(now + 0.15);
    this.voice = undefined;
  }

  close() {
    this.fadeVoice(this.context.currentTime);
    window.setTimeout(() => void this.context.close(), 160);
  }
}
