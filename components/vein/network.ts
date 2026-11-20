interface NetworkExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  init(seed: number): void;
  tick(dt: number): void;
  set_tempo(bpm: number): void;
  add_food(x: number, y: number): number;
  move_food(id: number, x: number, y: number): void;
  remove_food(id: number): void;
  food_mask(): number;
  food_buffer(): number;
  source(): number;
  hits(): number;
  line_buffer(): number;
  line_count(): number;
  spark_buffer(): number;
  spark_count(): number;
  note_buffer(id: number): number;
  audio_rate(): number;
  audio_frames(): number;
}

export async function loadNetwork(signal: AbortSignal) {
  const response = await fetch("/apps/vein.wasm", { signal });
  if (!response.ok) throw new Error("Network unavailable");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as NetworkExports;
  const view = (offset: number, length: number) =>
    new Float32Array(wasm.memory.buffer, offset, length);
  wasm.init(crypto.getRandomValues(new Uint32Array(1))[0]);
  const points = view(wasm.food_buffer(), 16);
  const lineBuffer = wasm.line_buffer();
  const sparkBuffer = wasm.spark_buffer();
  return {
    wasm,
    points,
    source: view(wasm.source(), 2),
    hits: view(wasm.hits(), 8),
    lines: () => view(lineBuffer, 7 * wasm.line_count()),
    sparks: () => view(sparkBuffer, 3 * wasm.spark_count()),
    foods() {
      const mask = wasm.food_mask();
      return Array.from({ length: 8 }, (_, id) => id)
        .filter((id) => mask & (1 << id))
        .map((id) => ({ id, x: points[2 * id], y: points[2 * id + 1] }));
    },
    note(id: number, context: AudioContext) {
      const samples = view(wasm.note_buffer(id), wasm.audio_frames());
      const buffer = context.createBuffer(1, samples.length, wasm.audio_rate());
      buffer.getChannelData(0).set(samples);
      return buffer;
    },
  };
}

export type Network = Awaited<ReturnType<typeof loadNetwork>>;

export function drawNetwork(
  ctx: CanvasRenderingContext2D,
  network: Network,
  glow: Float32Array,
  ink: string,
  light: string,
) {
  ctx.setTransform(ctx.canvas.width / 640, 0, 0, ctx.canvas.height / 400, 0, 0);
  ctx.clearRect(0, 0, 640, 400);
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  const lines = network.lines();
  for (let i = 0; i < lines.length; i += 7) {
    const strength = lines[i + 6];
    ctx.globalAlpha = Math.min(0.92, strength * 1.1);
    ctx.lineWidth = 0.55 + strength * 1.8;
    ctx.beginPath();
    ctx.moveTo(lines[i], lines[i + 1]);
    ctx.quadraticCurveTo(
      lines[i + 2],
      lines[i + 3],
      lines[i + 4],
      lines[i + 5],
    );
    ctx.stroke();
  }
  function dot(x: number, y: number, r: number) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = light;
  const sparks = network.sparks();
  for (let i = 0; i < sparks.length; i += 3) {
    const strength = sparks[i + 2];
    ctx.globalAlpha = Math.min(1, 0.2 + strength);
    dot(sparks[i], sparks[i + 1], 1 + 2 * strength);
  }
  ctx.globalAlpha = 1;
  dot(network.source[0], network.source[1], 3.4);
  const mask = network.wasm.food_mask();
  for (let id = 0; id < glow.length; id++) {
    if (!(mask & (1 << id))) continue;
    const x = network.points[id * 2],
      y = network.points[id * 2 + 1],
      level = glow[id];
    ctx.globalAlpha = 0.85;
    dot(x, y, 2.7);
    ctx.globalAlpha = 0.48 + level * 0.5;
    ctx.strokeStyle = light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 6.8 + level * 4, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
