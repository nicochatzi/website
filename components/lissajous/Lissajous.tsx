import type { PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "react-feather";
import { loadScope, ratios, ScopeAudio } from "./signal";

type Trace = Awaited<ReturnType<typeof loadScope>>;

function curvePath(points: Float32Array) {
  const commands = [];
  for (let i = 0; i < points.length; i += 2) {
    commands.push(
      `${i ? "L" : "M"}${(280 + 172 * points[i]).toFixed(1)} ${(200 - 172 * points[i + 1]).toFixed(1)}`,
    );
  }
  return `${commands.join("")}Z`;
}

export function Lissajous() {
  const [ratio, setRatio] = useState(3);
  const [phase, setPhase] = useState(90);
  const [trace, setTrace] = useState<Trace>();
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const audio = useRef<ScopeAudio | null>(null);
  const [yCycles, xCycles] = ratios[ratio];
  const points = useMemo(() => trace?.(ratio, phase), [trace, ratio, phase]);
  const path = useMemo(() => points && curvePath(points), [points]);

  const mute = useCallback(() => {
    audio.current?.close();
    audio.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadScope(controller.signal).then(
      (makeTrace) => {
        if (!controller.signal.aborted) setTrace(() => makeTrace);
      },
      () => {
        if (!controller.signal.aborted)
          setError("The scope could not load. Reload to try again.");
      },
    );
    function onVisibility() {
      if (document.hidden) mute();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", mute);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", mute);
      mute();
    };
  }, [mute]);

  useEffect(() => {
    if (playing && points) audio.current?.play(points, xCycles);
  }, [playing, points, xCycles]);

  async function toggleSound() {
    if (audio.current) return mute();
    let player: ScopeAudio | undefined;
    try {
      player = new ScopeAudio();
      audio.current = player;
      await player.context.resume();
      if (audio.current === player) {
        setError("");
        setPlaying(true);
      }
    } catch {
      if (player && audio.current !== player) return;
      mute();
      setError("Audio could not start in this browser.");
    }
  }

  function move(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    setRatio(
      Math.round(
        clamp((event.clientX - rect.left) / rect.width) * (ratios.length - 1),
      ),
    );
    setPhase(
      Math.round(clamp((rect.bottom - event.clientY) / rect.height) * 180),
    );
  }

  const SoundIcon = playing ? Volume2 : VolumeX;
  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <svg
          role="img"
          aria-label={`Lissajous curve at a ${yCycles} to ${xCycles} ratio and ${phase} degrees of phase`}
          viewBox="0 0 560 400"
          className="block w-full cursor-crosshair touch-none select-none bg-white/40 dark:bg-black/15"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              move(event);
          }}
        >
          <defs>
            <pattern
              id="scope-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 40V0H40" fill="none" className="stroke-muted/20" />
            </pattern>
          </defs>
          <rect width="560" height="400" fill="url(#scope-grid)" />
          <path
            d="M0 200H560 M280 0V400"
            fill="none"
            className="stroke-muted/40"
            strokeDasharray="3 4"
          />
          {path && (
            <path
              d={path}
              fill="none"
              className="stroke-link"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          )}
        </svg>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-muted/25 px-4 py-3 text-sm">
          <label className="flex min-w-24 flex-1 flex-col gap-1">
            <span className="flex justify-between gap-2 text-muted">
              x · ratio{" "}
              <span className="text-link">
                {yCycles}:{xCycles}
              </span>
            </span>
            <input
              type="range"
              aria-label="Frequency ratio"
              aria-valuetext={`${yCycles} to ${xCycles}`}
              min="0"
              max={ratios.length - 1}
              value={ratio}
              onChange={(event) => setRatio(event.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <label className="flex min-w-24 flex-1 flex-col gap-1">
            <span className="flex justify-between gap-2 text-muted">
              y · phase <span className="text-link">{phase}°</span>
            </span>
            <input
              type="range"
              aria-label="Phase"
              aria-valuetext={`${phase} degrees`}
              min="0"
              max="180"
              value={phase}
              onChange={(event) => setPhase(event.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <button
            type="button"
            aria-label="Sound"
            aria-pressed={playing}
            disabled={!trace}
            onClick={toggleSound}
            className="inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-3 text-link hover:border-link disabled:opacity-50"
          >
            <SoundIcon size={16} aria-hidden="true" /> sound{" "}
            {playing ? "on" : "off"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        Drag across the plot for ratio, up or down for phase.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
