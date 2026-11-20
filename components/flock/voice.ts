import type { FlockEngine } from "./simulation";

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
    flock: FlockEngine,
    grainSize: number,
    grainsPerSecond: number,
    glints: Float64Array,
    time: number,
  ) {
    if (!this.buffer || this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;
    this.next = Math.max(this.next, now);
    while (this.next < now + 0.07) {
      const [id, rate, duration, offset, stereo, level, spacing] =
        flock.nextGrain(grainSize, grainsPerSecond, this.buffer.duration);
      const source = this.ctx.createBufferSource();
      const envelope = this.ctx.createGain();
      const pan = this.ctx.createStereoPanner();
      source.buffer = this.buffer;
      source.playbackRate.value = rate;
      pan.pan.value = stereo;
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
      this.next += spacing;
    }
  }

  close() {
    this.request?.abort();
    this.buffer = undefined;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.012);
    window.setTimeout(() => void this.ctx.close(), 100);
  }
}
