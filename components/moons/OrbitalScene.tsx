import type { Instrument, Scene } from "./instrument";

export const bands = Array.from({ length: 12 }, (_, i) => -96 + 16 * i);
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
  const shadows = (surface: "floor" | "mask") =>
    scene.map((body) => (
      <ellipse
        key={body.index}
        cx={0}
        cy={0}
        fill={`url(#moons-${surface}-${body.index})`}
        rx={body.shadowMajor}
        ry={body.shadowMinor}
        transform={`translate(${body.shadowX} ${body.shadowZ}) rotate(${body.shadowAngle})`}
      />
    ));
  const active = scene[selected];
  const [xx, xy, zx, zy, ox, oy] = engine.floor;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 360"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {scene.flatMap((body) =>
          (["floor", "mask"] as const).map((surface) => {
            const color = surface === "mask" ? "black" : "var(--color-link)";
            return (
              <radialGradient
                key={`${surface}-${body.index}`}
                id={`moons-${surface}-${body.index}`}
              >
                <stop offset={body.coreFraction} stopColor={color} />
                <stop offset="1" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          }),
        )}
        <clipPath id="moons-deck">
          <rect x="-217" y="-106" width="434" height="212" rx="4" />
        </clipPath>
        <radialGradient id="moons-surface" cx="31%" cy="23%" r="78%">
          <stop offset="0" stopColor="var(--color-link)" />
          <stop
            offset=".48"
            stopColor="color-mix(in srgb, var(--color-link) 66%, var(--color-gray-925))"
          />
          <stop
            offset=".85"
            stopColor="color-mix(in srgb, var(--color-link) 14%, var(--color-gray-925))"
          />
          <stop offset="1" stopColor="var(--color-gray-925)" />
        </radialGradient>
        <mask
          id="moons-light"
          maskUnits="userSpaceOnUse"
          x="-97"
          y="-8"
          width="194"
          height="16"
        >
          <rect x="-97" y="-8" width="194" height="16" fill="white" />
          {shadows("mask")}
        </mask>
      </defs>
      <g transform={`matrix(${engine.floor.join(" ")})`}>
        <rect
          x="-217"
          y="-106"
          width="434"
          height="212"
          rx="4"
          className="fill-muted/5 stroke-muted/40"
          strokeWidth="1"
        />
        <path
          d={grid}
          fill="none"
          className="stroke-muted/25"
          strokeWidth=".9"
        />
        <g clipPath="url(#moons-deck)" opacity=".3">
          {shadows("floor")}
        </g>
        <path d="M-96 0H96" className="stroke-muted/40" strokeWidth="5" />
        <g mask="url(#moons-light)" className="fill-heading">
          <rect x="-96" y="-7" width="192" height="14" opacity=".16" />
          {bands.map((x) => (
            <rect key={x} x={x} y="-4" width="15.5" height="8" />
          ))}
        </g>
      </g>
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
      {active && (
        <line
          x1={active.x}
          y1={active.y}
          x2={ox + xx * active.shadowX + zx * active.shadowZ}
          y2={oy + xy * active.shadowX + zy * active.shadowZ}
          className="stroke-link/60"
          strokeDasharray="2 3"
        />
      )}
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
              fill="url(#moons-surface)"
              className="stroke-link/75"
              strokeWidth="1"
            />
          </g>
        ))}
    </svg>
  );
}
