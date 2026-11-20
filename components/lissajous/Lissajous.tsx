import type { PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, RotateCw, Volume2, VolumeX } from "react-feather";
import { tuning, useScopeMotion } from "./motion";
import { camera, curveLayers, floorGrid } from "./projection";
import { loadScope, ScopeAudio } from "./signal";

type Trace = Awaited<ReturnType<typeof loadScope>>;

export function Lissajous() {
  const { position, controls, alive, steer, toggleAlive } = useScopeMotion();
  const settings = useMemo(() => tuning(position), [position]);
  const degrees = Math.round(position.y * 180);
  const [trace, setTrace] = useState<Trace>();
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const audio = useRef<ScopeAudio | null>(null);
  const [orbit, setOrbit] = useState(false);
  const [view, setView] = useState({ yaw: 0.52, tilt: 0.32 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const project = useMemo(() => camera(view), [view]);
  const grid = useMemo(() => floorGrid(project), [project]);
  const layers = useMemo(
    () => trace && curveLayers(trace(settings), project),
    [trace, settings, project],
  );

  function rotate(horizontal: number, vertical: number) {
    setView(({ yaw, tilt }) => ({
      yaw: (yaw + horizontal) % (2 * Math.PI),
      tilt: Math.max(-1.15, Math.min(1.15, tilt + vertical)),
    }));
  }

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
    if (playing) audio.current?.tune(settings);
  }, [playing, settings]);

  async function toggleSound() {
    if (audio.current) return mute();
    let player: ScopeAudio | undefined;
    try {
      player = new ScopeAudio(settings);
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
    if (orbit) {
      const previous = drag.current;
      if (previous?.id === event.pointerId) {
        rotate(
          ((previous.x - event.clientX) * 2 * Math.PI) / rect.width,
          ((event.clientY - previous.y) * Math.PI) / rect.height,
        );
      }
      drag.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      return;
    }
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    steer({
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((rect.bottom - event.clientY) / rect.height),
    });
  }

  const SoundIcon = playing ? Volume2 : VolumeX;
  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <svg
          role="img"
          aria-label={`3D Lissajous curve at a ${settings.ratio.toFixed(2)} ratio, ${settings.depthRatio.toFixed(2)} depth ratio and ${degrees} degrees of phase`}
          viewBox="0 0 560 400"
          className={`block w-full touch-none select-none bg-white/40 dark:bg-black/15 ${orbit ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              move(event);
          }}
        >
          <path
            d={grid}
            fill="none"
            className="stroke-muted/25"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          {layers?.map(
            ({ path: d, depth }) =>
              d && (
                <path
                  key={depth}
                  d={d}
                  fill="none"
                  className="stroke-link"
                  strokeWidth={1.15 + depth * 0.11}
                  opacity={0.42 + depth * 0.052}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
          )}
        </svg>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-muted/25 px-4 py-3 text-sm sm:grid-cols-4">
          {(
            [
              [
                "x",
                "x · ratio",
                "Frequency ratio",
                `${settings.ratio.toFixed(2)}×`,
              ],
              ["y", "y · phase", "Phase", `${degrees}°`],
              [
                "z",
                "z · ratio",
                "Depth ratio",
                `${settings.depthRatio.toFixed(2)}×`,
              ],
              [
                "pitch",
                "pitch",
                "Base frequency",
                `${Math.round(settings.frequency)} Hz`,
              ],
            ] as const
          ).map(([axis, label, name, value]) => (
            <label key={axis} className="flex flex-col gap-1">
              <span className="flex justify-between gap-1 whitespace-nowrap text-xs text-muted sm:text-sm">
                {label}
                <span className="text-link">{value}</span>
              </span>
              <input
                type="range"
                aria-label={name}
                aria-valuetext={value}
                min="0"
                max="1"
                step="0.001"
                value={controls[axis]}
                onChange={(event) =>
                  steer({ [axis]: event.target.valueAsNumber })
                }
                className="h-5 w-full accent-link"
              />
            </label>
          ))}
          <div className="col-span-2 flex flex-wrap gap-2 text-xs sm:col-span-4 sm:text-sm">
            <button
              type="button"
              aria-label="Orbit view"
              aria-pressed={orbit}
              aria-describedby="scope-gesture"
              onClick={() => setOrbit((value) => !value)}
              onKeyDown={(event) => {
                if (!orbit) return;
                const directions: Record<string, [number, number]> = {
                  ArrowLeft: [-0.12, 0],
                  ArrowRight: [0.12, 0],
                  ArrowUp: [0, 0.12],
                  ArrowDown: [0, -0.12],
                };
                const delta = directions[event.key];
                if (delta) {
                  event.preventDefault();
                  rotate(...delta);
                }
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-2 text-link sm:px-3 hover:border-link aria-pressed:border-link"
            >
              <RotateCw
                size={16}
                className="hidden sm:block"
                aria-hidden="true"
              />{" "}
              orbit
            </button>
            <button
              type="button"
              aria-label="Alive mode"
              aria-pressed={alive}
              disabled={!trace}
              onClick={toggleAlive}
              className="inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-2 text-link sm:px-3 hover:border-link aria-pressed:border-link disabled:opacity-50"
            >
              <Activity
                size={16}
                className="hidden sm:block"
                aria-hidden="true"
              />{" "}
              alive {alive ? "on" : "off"}
            </button>
            <button
              type="button"
              aria-label="Sound"
              aria-pressed={playing}
              disabled={!trace}
              onClick={toggleSound}
              className="inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-2 text-link sm:px-3 hover:border-link disabled:opacity-50"
            >
              <SoundIcon
                size={16}
                className="hidden sm:block"
                aria-hidden="true"
              />{" "}
              sound {playing ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>
      <p id="scope-gesture" className="mt-3 text-sm text-muted">
        {orbit
          ? "Drag to rotate, or use the arrow keys on orbit."
          : "Drag across for ratio, up or down for phase. Select orbit to rotate."}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
