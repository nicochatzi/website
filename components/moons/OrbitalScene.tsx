import type { Instrument, Scene } from "./instrument";

const bands = Array.from({ length: 12 }, (_, i) => -96 + 16 * i);
const grid = [
  ...[-160, -80, 0, 80, 160].map((x) => `M${x} -106v212`),
  ...[-60, 0, 60].map((z) => `M-217 ${z}h434`),
].join("");

export function OrbitalScene({
  scene,
  engine,
  selected,
}: {
  scene: Scene;
  engine: Instrument;
  selected: number;
}) {
  const active = scene[selected];
  const [xx, xy, zx, zy, ox, oy] = engine.floor;
  const shadowX = ox + xx * active.shadowX + zx * active.shadowZ;
  const shadowY = oy + xy * active.shadowX + zy * active.shadowZ;
  const [rayX, rayY] = engine.ray;
  const sunAngle = (Math.atan2(-rayY, -rayX) * 180) / Math.PI;
  const shafts = (
    <g
      key="shafts"
      transform={`matrix(${xx} ${xy} ${rayX} ${rayY} ${ox} ${oy})`}
      fill="url(#moons-spill)"
    >
      {bands.map((x, i) => (
        <rect
          key={x}
          x={x}
          y="0"
          width="16"
          height="112"
          opacity={engine.light[i]}
        />
      ))}
    </g>
  );
  const deck = (
    <g key="deck" transform={`matrix(${engine.floor.join(" ")})`}>
      <rect
        x="-217"
        y="-106"
        width="434"
        height="212"
        rx="4"
        className="fill-muted/2 stroke-muted/20 dark:fill-muted/5"
        strokeWidth="1"
      />
      <path d={grid} fill="none" className="stroke-muted/12" strokeWidth=".9" />
      <g clipPath="url(#moons-deck)" className="opacity-20 dark:opacity-65">
        {scene.map((body) => (
          <ellipse
            key={body.index}
            cx={0}
            cy={0}
            fill={`url(#moons-shadow-${body.index})`}
            rx={body.shadowMajor}
            ry={body.shadowMinor}
            transform={`translate(${body.shadowX} ${body.shadowZ}) rotate(${body.shadowAngle})`}
          />
        ))}
      </g>
    </g>
  );
  const moons = (
    <g key="moons">
      {scene.map((body) => (
        <circle
          key={body.index}
          r="1"
          transform={body.orbit}
          fill="none"
          className="stroke-muted/45"
          strokeWidth=".8"
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <line
        x1={active.x}
        y1={active.y}
        x2={shadowX}
        y2={shadowY}
        className="stroke-muted/50"
        strokeDasharray="2 3"
      />
      {scene
        .toSorted((a, b) => a.depth - b.depth)
        .map((body) => (
          <g key={body.index} transform={`translate(${body.x} ${body.y})`}>
            {body.index === selected && (
              <circle
                r={body.radius + 4}
                fill="none"
                className="stroke-link/65"
                strokeWidth=".9"
              />
            )}
            <circle
              r={body.radius}
              className="fill-gray-900 stroke-muted/45"
              strokeWidth="1"
            />
            <path
              d="M0 -1 A1 1 0 0 1 0 1 A.88 1 0 0 0 0 -1Z"
              transform={`rotate(${sunAngle}) scale(${body.radius})`}
              className="fill-offwhite/85"
            />
          </g>
        ))}
    </g>
  );
  const belowPlane = xx * zy - xy * zx < 0;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 360"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {scene.map((body) => (
          <radialGradient key={body.index} id={`moons-shadow-${body.index}`}>
            <stop offset={body.coreFraction} stopColor="black" />
            <stop offset="1" stopColor="black" stopOpacity="0" />
          </radialGradient>
        ))}
        <clipPath id="moons-deck">
          <rect x="-217" y="-106" width="434" height="212" rx="4" />
        </clipPath>
        <linearGradient id="moons-spill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--color-heading)" stopOpacity=".7" />
          <stop
            offset=".55"
            stopColor="var(--color-heading)"
            stopOpacity=".28"
          />
          <stop offset="1" stopColor="var(--color-heading)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {belowPlane ? [moons, deck, shafts] : [shafts, deck, moons]}
    </svg>
  );
}
