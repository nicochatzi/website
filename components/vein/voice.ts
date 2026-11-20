import { InstrumentOutput } from "@/lib/instrumentOutput";
import type { Network } from "./network";

export class VeinVoice {
  private output = new InstrumentOutput("vein");
  private notes: AudioBuffer[] = [];

  start() {
    return this.output.context.resume();
  }

  strike(network: Network, id: number, strength: number) {
    const ctx = this.output.context;
    if (ctx.state !== "running") return;
    const source = ctx.createBufferSource();
    source.buffer = this.notes[id] ??= network.note(id, ctx);
    const gain = ctx.createGain();
    gain.gain.value = 0.95 * Math.sqrt(strength);
    const pan = ctx.createStereoPanner();
    pan.pan.value = (network.points[2 * id] / 320 - 1) * 0.75;
    source.connect(gain).connect(pan).connect(this.output.input);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      pan.disconnect();
    };
    source.start();
  }

  close() {
    this.output.close();
  }
}
