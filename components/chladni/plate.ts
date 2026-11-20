interface PlateExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  init(): number;
  count(): number;
  note_count(): number;
  select(index: number): void;
  selected(): number;
  note(index: number): number;
  advance(seconds: number, alive: boolean): number;
}

export async function loadPlate(signal: AbortSignal) {
  const response = await fetch("/apps/chladni.wasm", { signal });
  if (!response.ok) throw new Error("Could not load the plate");
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
  );
  const wasm = instance.exports as PlateExports;
  const grains = new Float32Array(
    wasm.memory.buffer,
    wasm.init(),
    wasm.count() * 2,
  );
  return { wasm, grains };
}

export type Plate = Awaited<ReturnType<typeof loadPlate>>;

export function drawPlate(
  ctx: CanvasRenderingContext2D,
  grains: Float32Array,
  ink: string,
) {
  const size = ctx.canvas.width;
  const margin = size * 0.055;
  const span = size - 2 * margin;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = size / 800;
  ctx.globalAlpha = 0.36;
  ctx.beginPath();
  for (const x of [margin, size - margin]) {
    for (const y of [margin, size - margin]) {
      ctx.moveTo(x, y + ((y < size / 2 ? 1 : -1) * margin) / 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x + ((x < size / 2 ? 1 : -1) * margin) / 2, y);
    }
  }
  ctx.stroke();
  for (let layer = 0; layer < 3; layer++) {
    const grain = size * (0.0018 + layer * 0.0006);
    ctx.globalAlpha = 0.43 + layer * 0.2;
    for (let i = 2 * layer; i < grains.length; i += 6) {
      ctx.fillRect(
        margin + grains[i] * span,
        margin + grains[i + 1] * span,
        grain,
        grain,
      );
    }
  }
  ctx.globalAlpha = 1;
}
