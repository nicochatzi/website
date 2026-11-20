import { InstrumentOutput } from "@/lib/instrumentOutput";
import type { FlockEngine } from "./simulation";

const windowShape = Float32Array.from(
  { length: 65 },
  (_, i) => Math.sin((Math.PI * i) / 64) ** 2,
);

function grainLevels(buffer: AudioBuffer) {
  const stride = Math.max(1, Math.round(buffer.sampleRate * 0.01));
  const buckets = Math.ceil(buffer.length / stride);
  const energy = new Float64Array(buckets + 1);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let b = 0; b < buckets; b++) {
      const end = Math.min((b + 1) * stride, data.length);
      let sum = 0;
      for (let i = b * stride; i < end; i++) sum += data[i] * data[i];
      energy[b + 1] += sum;
    }
  }
  for (let b = 1; b <= buckets; b++) energy[b] += energy[b - 1];

  return (offset: number, seconds: number) => {
    const start = Math.min(
      buckets - 1,
      Math.floor((offset * buffer.sampleRate) / stride),
    );
    const end = Math.min(
      buckets,
      Math.max(
        start + 1,
        Math.ceil(((offset + seconds) * buffer.sampleRate) / stride),
      ),
    );
    const frames = Math.min(end * stride, buffer.length) - start * stride;
    const rms = Math.sqrt(
      (energy[end] - energy[start]) / (frames * buffer.numberOfChannels),
    );
    return Math.max(0.4, Math.min(4, (0.072 / Math.max(rms, 0.001)) ** 0.8));
  };
}

export class FlockVoice {
  private output = new InstrumentOutput("flock");
  private ctx = this.output.context;
  private request?: AbortController;
  private sample?: {
    buffer: AudioBuffer;
    level: ReturnType<typeof grainLevels>;
  };
  private next = 0;

  async load(url: string) {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.sample = undefined;
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
      this.sample = { buffer, level: grainLevels(buffer) };
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
    if (!this.sample || this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;
    this.next = Math.max(this.next, now);
    while (this.next < now + 0.07) {
      const [id, rate, duration, offset, stereo, level, spacing] =
        flock.nextGrain(
          grainSize,
          grainsPerSecond,
          this.sample.buffer.duration,
        );
      const source = this.ctx.createBufferSource();
      const envelope = this.ctx.createGain();
      const pan = this.ctx.createStereoPanner();
      source.buffer = this.sample.buffer;
      source.playbackRate.value = rate;
      pan.pan.value = stereo;
      const gain = level * this.sample.level(offset, duration * rate);
      envelope.gain.setValueCurveAtTime(
        windowShape.map((v) => v * gain),
        this.next,
        duration,
      );
      source.connect(envelope).connect(pan).connect(this.output.input);
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
    this.sample = undefined;
    this.output.close();
  }
}
