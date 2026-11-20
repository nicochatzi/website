const intervals = [0.75, 1, 1.125, 1.25, 1.5];
const windowShape = Float32Array.from(
  { length: 65 },
  (_, i) => Math.sin((Math.PI * i) / 64) ** 2,
);

export class FlockVoice {
  private ctx = new AudioContext();
  private master = this.ctx.createGain();
  private request?: AbortController;
  private buffer?: AudioBuffer;
  private next = 0;

  constructor() {
    this.master.gain.value = 0.18;
    this.master.connect(this.ctx.destination);
  }

  async load(url: string) {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.buffer = undefined;
    try {
      const [, response] = await Promise.all([
        this.ctx.resume(),
        fetch(url, { signal: request.signal }),
      ]);
      if (!response.ok) throw new Error("Sample unavailable");
      const buffer = await this.ctx.decodeAudioData(
        await response.arrayBuffer(),
      );
      if (request.signal.aborted) return false;
      this.buffer = buffer;
      return true;
    } catch (error) {
      if (request.signal.aborted) return false;
      throw error;
    }
  }

  play(
    birds: Float32Array,
    grainSize: number,
    grainsPerSecond: number,
    glints: Float64Array,
    time: number,
  ) {
    if (!this.buffer || this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;
    this.next = Math.max(this.next, now);
    while (this.next < now + 0.07) {
      const id = Math.floor((Math.random() * birds.length) / 5);
      const x = birds[id * 5] / 1.6,
        y = birds[id * 5 + 1],
        crowd = birds[id * 5 + 4];
      const rate = intervals[Math.min(4, Math.floor((1 - y) * 5))];
      const duration = Math.min(
        this.buffer.duration / rate,
        grainSize * (0.65 + 0.85 * crowd),
      );
      const offset = x * Math.max(0, this.buffer.duration - duration * rate);
      const source = this.ctx.createBufferSource();
      const envelope = this.ctx.createGain();
      const pan = this.ctx.createStereoPanner();
      source.buffer = this.buffer;
      source.playbackRate.value = rate;
      pan.pan.value = (2 * x - 1) * 0.85;
      // A Hann window on each grain softens both ends. Compensate for overlap.
      const level = 0.8 / Math.sqrt(Math.max(1, grainsPerSecond * duration));
      envelope.gain.setValueCurveAtTime(
        windowShape.map((v) => v * level),
        this.next,
        duration,
      );
      source.connect(envelope).connect(pan).connect(this.master);
      source.start(this.next, offset);
      source.stop(this.next + duration);
      source.onended = () => {
        source.disconnect();
        envelope.disconnect();
        pan.disconnect();
      };
      glints[id] = time + (this.next - now) + duration;
      this.next += (0.88 + 0.24 * Math.random()) / grainsPerSecond;
    }
  }

  close() {
    this.request?.abort();
    this.buffer = undefined;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.012);
    window.setTimeout(() => void this.ctx.close(), 100);
  }
}
