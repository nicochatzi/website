import type { PondEngine } from "./surface";

const bands = [
  [-0.035, 0.28],
  [0.002, 0.23],
  [0.014, 0.52],
  [0.065, 0.82],
  [0.22, 1],
] as const;

export function contours(
  ctx: CanvasRenderingContext2D,
  pond: PondEngine,
  ink: string,
) {
  const { width: cols, height: rows } = pond;
  const { canvas } = ctx;
  const cssWidth = canvas.clientWidth;
  if (!cssWidth) return;
  const w = Math.round(cssWidth * devicePixelRatio),
    h = Math.round(canvas.clientHeight * devicePixelRatio);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(w / (cols - 1), 0, 0, h / (rows - 1), 0, 0);
  ctx.clearRect(0, 0, cols, rows);
  ctx.lineWidth = (1.05 * (cols - 1)) / cssWidth;
  ctx.strokeStyle = ink;
  for (const [level, opacity] of bands) {
    ctx.beginPath();
    ctx.globalAlpha = opacity;
    const lines = pond.contour(level);
    for (let i = 0; i < lines.length; i += 4) {
      ctx.moveTo(lines[i], lines[i + 1]);
      ctx.lineTo(lines[i + 2], lines[i + 3]);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
