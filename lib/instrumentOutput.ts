let compiledRoom: Promise<WebAssembly.Module> | undefined;

function loadRoom() {
  compiledRoom ??= fetch("/audio/room.wasm")
    .then(async (response) => {
      if (!response.ok) throw new Error("Room unavailable");
      return WebAssembly.compile(await response.arrayBuffer());
    })
    .catch((error) => {
      compiledRoom = undefined;
      throw error;
    });
  return compiledRoom;
}

export class InstrumentOutput {
  readonly context = new AudioContext();
  readonly input = this.context.createGain();
  private master = this.context.createGain();
  readonly gain = this.master.gain;
  private closing = false;

  constructor() {
    this.input.connect(this.master).connect(this.context.destination);
    if (this.context.audioWorklet) {
      this.attachRoom().catch((error) => {
        if (!this.closing) console.warn("Room reverb unavailable", error);
      });
    }
  }

  private async attachRoom() {
    const [module] = await Promise.all([
      loadRoom(),
      this.context.audioWorklet.addModule("/audio/room-worklet.js"),
    ]);
    if (this.closing) return;
    const room = new AudioWorkletNode(this.context, "htz-room", {
      channelCount: 2,
      channelCountMode: "explicit",
      outputChannelCount: [2],
      processorOptions: { module },
    });
    this.input.connect(room).connect(this.master);
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    this.gain.setTargetAtTime(0, this.context.currentTime, 0.012);
    window.setTimeout(() => void this.context.close(), 100);
  }
}
