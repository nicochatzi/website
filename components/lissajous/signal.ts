export interface Tuning {
  frequency: number;
  ratio: number;
  depthRatio: number;
  phase: number;
}

interface ScopeExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  point_count: () => number;
  trace: (xHz: number, yHz: number, radians: number, zHz: number) => number;
}

export async function loadScope(signal: AbortSignal) {
  const response = await fetch("/apps/lissajous.wasm", { signal });
  if (!response.ok) throw new Error("Could not load the scope");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as ScopeExports;
  return ({ frequency, ratio, phase, depthRatio }: Tuning) => {
    const offset = wasm.trace(
      frequency,
      frequency * ratio,
      phase,
      frequency * depthRatio,
    );
    return new Float32Array(wasm.memory.buffer, offset, 3 * wasm.point_count());
  };
}

export class ScopeAudio {
  readonly context = new AudioContext();
  private master = this.context.createGain();
  private x = this.context.createOscillator();
  private ySin = this.context.createOscillator();
  private yCos = this.context.createOscillator();
  private sinGain = this.context.createGain();
  private cosGain = this.context.createGain();

  constructor(initial: Tuning) {
    const ctx = this.context;
    // Two phase-locked quadrature tones let phase glide without restarting Y.
    this.yCos.setPeriodicWave(
      ctx.createPeriodicWave(new Float32Array([0, 1]), new Float32Array(2), {
        disableNormalization: true,
      }),
    );
    const left = ctx.createStereoPanner();
    const right = ctx.createStereoPanner();
    left.pan.value = -0.4;
    right.pan.value = 0.4;
    this.x.connect(left);
    this.ySin.connect(this.sinGain).connect(right);
    this.yCos.connect(this.cosGain).connect(right);
    left.connect(this.master);
    right.connect(this.master);
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    const now = ctx.currentTime;
    this.x.frequency.value = initial.frequency;
    this.ySin.frequency.value = this.yCos.frequency.value =
      initial.frequency * initial.ratio;
    this.sinGain.gain.value = Math.cos(initial.phase);
    this.cosGain.gain.value = Math.sin(initial.phase);
    for (const oscillator of [this.x, this.ySin, this.yCos])
      oscillator.start(now);
    this.master.gain.setTargetAtTime(0.04, now, 0.025);
  }

  tune({ frequency, ratio, phase }: Tuning) {
    const now = this.context.currentTime;
    this.x.frequency.setTargetAtTime(frequency, now, 0.02);
    this.ySin.frequency.setTargetAtTime(frequency * ratio, now, 0.02);
    this.yCos.frequency.setTargetAtTime(frequency * ratio, now, 0.02);
    this.sinGain.gain.setTargetAtTime(Math.cos(phase), now, 0.02);
    this.cosGain.gain.setTargetAtTime(Math.sin(phase), now, 0.02);
  }

  close() {
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(0, now, 0.015);
    for (const oscillator of [this.x, this.ySin, this.yCos])
      oscillator.stop(now + 0.15);
    window.setTimeout(() => void this.context.close(), 160);
  }
}
