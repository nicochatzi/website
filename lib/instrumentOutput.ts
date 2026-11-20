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

const trimDb = {
  lissa: -6.5,
  flock: 0,
  moons: 0,
  pond: -2,
  chladni: -2,
};

export class InstrumentOutput {
  readonly context = new AudioContext();
  readonly input = this.context.createGain();
  private master = this.context.createGain();
  readonly gain = this.master.gain;
  private closing = false;

  constructor(instrument: keyof typeof trimDb) {
    this.input.gain.value = 10 ** (trimDb[instrument] / 20);
    this.master.connect(this.context.destination);
    if (this.context.audioWorklet) {
      this.attachRoom().catch((error) => {
        if (this.closing) return;
        console.warn("Instrument effects unavailable", error);
        this.attachFallback();
      });
    } else {
      this.attachFallback();
    }
  }

  private attachFallback() {
    const ceiling = this.context.createWaveShaper();
    ceiling.curve = Float32Array.from(
      { length: 2049 },
      (_, i) => 0.22 * Math.tanh((i / 1024 - 1) / 0.22),
    );
    this.input.connect(ceiling).connect(this.master);
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
