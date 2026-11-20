import { InstrumentOutput } from "@/lib/instrumentOutput";

interface MoonsExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  advance(seconds: number, held: number): void;
  move(index: number, dx: number, dy: number): void;
  lift(index: number, height: number): void;
  set_speed(index: number, speed: number): void;
  set_width(index: number, width: number): void;
  rotate(dx: number, dy: number): void;
  reset_view(): void;
  floor_transform(): number;
  positions(): number;
  bands(): number;
}

export async function loadMoons(signal: AbortSignal) {
  const response = await fetch("/apps/moons.wasm", { signal });
  if (!response.ok) throw new Error("Moons unavailable");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as MoonsExports;
  const buffer = wasm.memory.buffer;
  const moonCount = 3;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < moonCount; i++) wasm.set_speed(i, 0);
  }
  const bodyStride = 20;
  const positions = new Float32Array(
    buffer,
    wasm.positions(),
    moonCount * bodyStride,
  );
  const light = new Float32Array(buffer, wasm.bands(), 12);
  return {
    light,
    move: wasm.move,
    lift: wasm.lift,
    setWidth: wasm.set_width,
    setSpeed: wasm.set_speed,
    rotate: wasm.rotate,
    resetView: wasm.reset_view,
    floor: new Float32Array(buffer, wasm.floor_transform(), 6),
    frame(seconds: number, held: number) {
      wasm.advance(seconds, held);
      return Array.from({ length: moonCount }, (_, i) => {
        const [
          x,
          y,
          radius,
          depth,
          height,
          shadowX,
          shadowZ,
          worldRadius,
          shadowMajor,
          shadowMinor,
          shadowAngle,
          coreFraction,
          ux,
          uy,
          vx,
          vy,
          cx,
          cy,
          width,
          speed,
        ] = positions.subarray(i * bodyStride, (i + 1) * bodyStride);
        return {
          index: i,
          x,
          y,
          radius,
          depth,
          height,
          shadowX,
          shadowZ,
          worldRadius,
          shadowMajor,
          shadowMinor,
          shadowAngle,
          coreFraction,
          width,
          speed,
          orbit: `matrix(${ux} ${uy} ${vx} ${vy} ${cx} ${cy})`,
        };
      });
    },
  };
}

export type Instrument = Awaited<ReturnType<typeof loadMoons>>;
export type Scene = ReturnType<Instrument["frame"]>;

let compiledPad: Promise<WebAssembly.Module> | undefined;

function loadPad() {
  compiledPad ??= fetch("/audio/moons-pad.wasm")
    .then(async (response) => {
      if (!response.ok) throw new Error("Moons pad unavailable");
      return WebAssembly.compile(await response.arrayBuffer());
    })
    .catch((error) => {
      compiledPad = undefined;
      throw error;
    });
  return compiledPad;
}

export class MoonsPad {
  private output = new InstrumentOutput();
  private node?: AudioWorkletNode;
  private closed = false;
  private light: Float32Array;

  constructor(instrument: Instrument) {
    this.light = instrument.light.slice();
    this.output.gain.value = 0;
  }

  async start() {
    const ctx = this.output.context;
    const [module] = await Promise.all([
      loadPad(),
      ctx.resume(),
      ctx.audioWorklet.addModule("/audio/moons-pad.js"),
    ]);
    if (this.closed) return;
    this.node = new AudioWorkletNode(ctx, "moons-pad", {
      numberOfInputs: 0,
      outputChannelCount: [2],
      processorOptions: { module, light: this.light },
    });
    this.node.connect(this.output.input);
    this.output.gain.setTargetAtTime(0.85, ctx.currentTime, 0.15);
  }

  shade(light: Float32Array) {
    if (this.light.every((v, i) => v === light[i])) return;
    this.light.set(light);
    this.node?.port.postMessage(this.light);
  }

  close() {
    this.closed = true;
    this.output.close();
  }
}
