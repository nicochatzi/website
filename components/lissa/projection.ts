function xy(points: Float32Array, i: number) {
  return `${points[i].toFixed(2)} ${points[i + 1].toFixed(2)}`;
}

export function curveLayers(points: Float32Array) {
  const layers = Array.from({ length: 12 }, (_, depth) => ({
    depth,
    path: "",
  }));
  let previous = xy(points, 0);
  let previousLayer = -1;
  for (let i = 3; i < points.length; i += 3) {
    const depth = points[i + 2];
    const next = xy(points, i);
    if (depth !== previousLayer) layers[depth].path += `M${previous}`;
    layers[depth].path += `L${next}`;
    previous = next;
    previousLayer = depth;
  }
  return layers;
}
