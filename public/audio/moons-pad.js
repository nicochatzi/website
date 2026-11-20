class MoonsPad extends AudioWorkletProcessor {
  constructor({ processorOptions }) {
    super();
    const { exports } = new WebAssembly.Instance(processorOptions.module);
    exports.init(sampleRate);
    this.render = exports.render;
    const buffer = exports.memory.buffer;
    this.left = new Float32Array(buffer, exports.left_buffer(), 128);
    this.right = new Float32Array(buffer, exports.right_buffer(), 128);
    const light = new Float32Array(buffer, exports.light_buffer(), 12);
    light.set(processorOptions.light);
    this.port.onmessage = ({ data }) => light.set(data);
  }

  process(_inputs, outputs) {
    const [left, right] = outputs[0];
    if (left.length === this.left.length) {
      this.render(left.length);
      left.set(this.left);
      right.set(this.right);
    } else {
      for (let start = 0; start < left.length; start += this.left.length) {
        const count = Math.min(this.left.length, left.length - start);
        this.render(count);
        for (let i = 0; i < count; i++) {
          left[start + i] = this.left[i];
          right[start + i] = this.right[i];
        }
      }
    }
    return true;
  }
}

registerProcessor("moons-pad", MoonsPad);
