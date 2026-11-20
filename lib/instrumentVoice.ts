import { InstrumentOutput } from "./instrumentOutput";

let compiled: Promise<WebAssembly.Module> | undefined;

function loadVoice() {
  compiled ??= fetch("/audio/instrument-voices.wasm")
    .then(async (response) => {
      if (!response.ok) throw new Error("Instrument voice unavailable");
      return WebAssembly.compile(await response.arrayBuffer());
    })
    .catch((error) => {
      compiled = undefined;
      throw error;
    });
  return compiled;
}

export type VoiceControls = [number, number, number, number];

export class InstrumentVoice {
  private output = new InstrumentOutput();
  private node?: AudioWorkletNode;
  private closed = false;

  constructor(
    private instrument: "chladni" | "lissa",
    private controls: VoiceControls,
  ) {
    this.output.gain.value = 0;
  }

  async start() {
    const ctx = this.output.context;
    const [module] = await Promise.all([
      loadVoice(),
      ctx.resume(),
      ctx.audioWorklet.addModule("/audio/instrument-voice.js"),
    ]);
    if (this.closed) return;
    this.node = new AudioWorkletNode(ctx, "instrument-voice", {
      numberOfInputs: 0,
      outputChannelCount: [2],
      processorOptions: {
        module,
        instrument: this.instrument,
        controls: this.controls,
      },
    });
    this.node.connect(this.output.input);
    this.output.gain.setTargetAtTime(0.9, ctx.currentTime, 0.06);
  }

  tune(controls: VoiceControls) {
    this.controls = controls;
    this.node?.port.postMessage(controls);
  }

  close() {
    this.closed = true;
    this.output.close();
  }
}
