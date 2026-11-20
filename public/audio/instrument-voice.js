class InstrumentVoice extends AudioWorkletProcessor {
  constructor({ processorOptions: { module, instrument, controls } }) {
    super();
    this.voice = new WebAssembly.Instance(module).exports;
    this.voice.init(sampleRate, instrument === "chladni", ...controls);
    this.left = new Float32Array(this.voice.memory.buffer, this.voice.left_buffer(), 128);
    this.right = new Float32Array(this.voice.memory.buffer, this.voice.right_buffer(), 128);
    this.port.onmessage = ({ data }) => this.voice.tune(...data);
  }

  process(_inputs, [[left, right]]) {
    for (let start = 0; start < left.length; start += this.left.length) {
      const count = Math.min(this.left.length, left.length - start);
      this.voice.render(count);
      if (count === this.left.length) {
        left.set(this.left, start);
        right.set(this.right, start);
      } else {
        for (let i = 0; i < count; i++) {
          left[start + i] = this.left[i];
          right[start + i] = this.right[i];
        }
      }
    }
    return true;
  }
}
registerProcessor("instrument-voice", InstrumentVoice);
