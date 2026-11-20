class RoomProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { exports } = new WebAssembly.Instance(options.processorOptions.module);
    exports.init(sampleRate);
    this.render = exports.process_mix;
    this.tailFrames = exports.tail_frames(sampleRate);
    this.left = new Float32Array(exports.memory.buffer, exports.left_buffer(), 128);
    this.right = new Float32Array(exports.memory.buffer, exports.right_buffer(), 128);
    this.tail = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    const frames = output[0].length;
    if (input.length) this.tail = this.tailFrames;
    else if (this.tail <= 0) return true;
    else this.tail -= frames;

    const left = input[0];
    const right = input[1] ?? left;
    if (frames === this.left.length) {
      if (left) {
        this.left.set(left);
        this.right.set(right);
      } else {
        this.left.fill(0);
        this.right.fill(0);
      }
      this.render(frames);
      output[0].set(this.left);
      output[1].set(this.right);
    } else {
      for (let start = 0; start < frames; start += this.left.length) {
        const count = Math.min(this.left.length, frames - start);
        for (let i = 0; i < count; i++) {
          this.left[i] = left?.[start + i] ?? 0;
          this.right[i] = right?.[start + i] ?? 0;
        }
        this.render(count);
        for (let i = 0; i < count; i++) {
          output[0][start + i] = this.left[i];
          output[1][start + i] = this.right[i];
        }
      }
    }
    return true;
  }
}

registerProcessor("htz-room", RoomProcessor);
