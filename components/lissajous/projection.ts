export interface View {
  yaw: number;
  tilt: number;
}

export function camera({ yaw, tilt }: View) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  return (x: number, y: number, z: number) => {
    const side = cy * x - sy * z;
    const forward = sy * x + cy * z;
    const height = ct * y - st * forward;
    const depth = st * y + ct * forward;
    const scale = 104 / (1 - depth / 6);
    return {
      xy: `${(280 + scale * side).toFixed(2)} ${(195 - scale * height).toFixed(2)}`,
      depth,
    };
  };
}

type Project = ReturnType<typeof camera>;

export function floorGrid(project: Project) {
  const lines = [];
  for (let i = -4; i <= 4; i++) {
    const v = i / 4;
    lines.push(
      `M${project(v, -1.05, -1).xy}L${project(v, -1.05, 1).xy}`,
      `M${project(-1, -1.05, v).xy}L${project(1, -1.05, v).xy}`,
    );
  }
  return lines.join("");
}

// Paint distant segments first so a nearer strand reads clearly at crossings.
export function curveLayers(points: Float32Array, project: Project) {
  const layers = Array.from({ length: 12 }, (_, depth) => ({
    depth,
    path: "",
  }));
  let previous = project(points[0], points[1], points[2]);
  let previousLayer = -1;
  for (let i = 3; i < points.length; i += 3) {
    const next = project(points[i], points[i + 1], points[i + 2]);
    const depth = (previous.depth + next.depth) / 2;
    const layer = Math.min(
      11,
      Math.max(0, Math.floor((depth / 3.5 + 0.5) * 12)),
    );
    if (layer !== previousLayer) layers[layer].path += `M${previous.xy}`;
    layers[layer].path += `L${next.xy}`;
    previous = next;
    previousLayer = layer;
  }
  return layers;
}
