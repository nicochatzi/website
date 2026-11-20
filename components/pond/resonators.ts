import { InstrumentOutput } from "@/lib/instrumentOutput";
import type { PondEngine } from "./surface";

const modes = [
  { ratio: 1, level: 1, decay: 0.74 },
  { ratio: 2.003, level: 0.34, decay: 0.49 },
  { ratio: 2.991, level: 0.22, decay: 0.35 },
  { ratio: 4.12, level: 0.18, decay: 0.19 },
  { ratio: 5.47, level: 0.12, decay: 0.12 },
  { ratio: 7.08, level: 0.07, decay: 0.07 },
];

export class Resonators {
  private output = new InstrumentOutput("pond");
  readonly context = this.output.context;
  private mix = this.context.createWaveShaper();
  private banks: ReturnType<Resonators["bank"]>[];
  constructor(
    notes: { hz: number }[],
    positions: { x: number }[],
    private pond: PondEngine,
  ) {
    const mix = this.mix;
    mix.curve = Float32Array.from(
      { length: 2049 },
      (_, i) => 0.16 * Math.tanh(1.6 * (i / 1024 - 1)),
    );
    mix.connect(this.output.input);
    this.banks = notes.map(({ hz }, i) => this.bank(hz, positions[i].x));
  }

  private bank(hz: number, x: number) {
    const ctx = this.context;
    const input = ctx.createGain(),
      output = ctx.createGain(),
      pan = ctx.createStereoPanner();
    pan.pan.value = (2 * x - 1) * 0.84;
    output.connect(pan).connect(this.mix);
    const resonators = modes.map((mode) => {
      const theta = (2 * Math.PI * hz * mode.ratio) / ctx.sampleRate;
      const radius = Math.exp(-1 / (ctx.sampleRate * mode.decay));
      const filter = ctx.createIIRFilter(
        [0, mode.level * radius * Math.sin(theta)],
        [1, -2 * radius * Math.cos(theta), radius * radius],
      );
      input.connect(filter).connect(output);
      return filter;
    });
    return {
      hz,
      input,
      pan,
      retire: () => {
        output.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        window.setTimeout(() => {
          input.disconnect();
          for (const filter of resonators) filter.disconnect();
          output.disconnect();
          pan.disconnect();
        }, 450);
      },
    };
  }

  tune(notes: { hz: number }[], positions: { x: number }[]) {
    for (const [i, note] of notes.entries()) {
      if (this.banks[i].hz === note.hz) continue;
      this.banks[i].retire();
      this.banks[i] = this.bank(note.hz, positions[i].x);
    }
  }

  pan(index: number, x: number) {
    this.banks[index].pan.pan.setTargetAtTime(
      (2 * x - 1) * 0.84,
      this.context.currentTime,
      0.025,
    );
  }

  strike(index: number, crest: number) {
    const ctx = this.context;
    if (ctx.state !== "running") return;
    const samples = this.pond.pulse(
      this.banks[index].hz,
      ctx.sampleRate,
      crest,
    );
    const pulse = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    pulse.getChannelData(0).set(samples);
    const hit = ctx.createBufferSource();
    hit.buffer = pulse;
    hit.connect(this.banks[index].input);
    hit.onended = () => hit.disconnect();
    hit.start();
  }

  close() {
    this.output.close();
  }
}
