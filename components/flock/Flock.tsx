import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppSelect } from "@/components/AppSelect";
import { samples } from "./samples";
import { loadFlock } from "./simulation";
import { FlockVoice } from "./voice";

type Simulation = Awaited<ReturnType<typeof loadFlock>>;
type Target = { x: number; y: number };
const buttonClass =
  "min-h-9 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50";
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

export function Flock() {
  const [sample, setSample] = useState(samples[0]);
  const [sim, setSim] = useState<Simulation>();
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState<"off" | "loading" | "on">("off");
  const [cohesion, setCohesion] = useState(0.68);
  const [grainsPerSecond, setGrainsPerSecond] = useState(16);
  const [grain, setGrain] = useState(180);
  const [target, setTarget] = useState<Target | null>(null);
  const [error, setError] = useState("");
  const voice = useRef<FlockVoice | null>(null);
  const [paths, setPaths] = useState(["", "", ""]);
  const controls = useRef({ cohesion, grain, grainsPerSecond, target });
  useEffect(() => {
    controls.current = { cohesion, grain, grainsPerSecond, target };
  }, [cohesion, grain, grainsPerSecond, target]);

  const mute = useCallback(() => {
    voice.current?.close();
    voice.current = null;
    setSound("off");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadFlock(controller.signal).then(
      (flock) => {
        if (controller.signal.aborted) return;
        setSim(flock);
        setRunning(
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
      },
      () => {
        if (!controller.signal.aborted)
          setError("The flock could not load. Reload to try again.");
      },
    );
    function hide() {
      mute();
      setTarget(null);
    }
    function visibility() {
      if (document.hidden) hide();
    }
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", hide);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", hide);
      mute();
    };
  }, [mute]);

  useEffect(() => {
    if (!sim) return;
    const glints = new Float64Array(sim.count);
    let previous = performance.now(),
      remainder = 0,
      frame = 0;
    function draw(now: number) {
      if (!sim) return;
      const { cohesion, grain, grainsPerSecond, target } = controls.current;
      remainder += Math.min(0.05, Math.max(0, (now - previous) / 1000));
      previous = now;
      while (running && remainder >= 1 / 60) {
        sim.step(cohesion, target?.x ?? -1, target?.y ?? -1);
        remainder -= 1 / 60;
      }
      if (running)
        voice.current?.play(
          sim,
          grain / 1000,
          grainsPerSecond,
          glints,
          now / 1000,
        );
      setPaths(sim.paths(now / 1000, glints));
      if (running) frame = requestAnimationFrame(draw);
    }
    draw(previous);
    return () => cancelAnimationFrame(frame);
  }, [sim, running]);

  async function playSample(id: string) {
    let player: FlockVoice | undefined;
    try {
      player = voice.current ?? new FlockVoice();
      voice.current = player;
      setSound("loading");
      setError("");
      const loaded = await player.load(`/apps/flock-samples/${id}.mp3`);
      if (loaded && voice.current === player) {
        setRunning(true);
        setSound("on");
      }
    } catch {
      if (player && voice.current !== player) return;
      mute();
      setError("The sample could not load. Select sound to try again.");
    }
  }

  function guide(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setTarget({
      x: clamp(((event.clientX - rect.left) / rect.width) * 1.6, 1.6),
      y: clamp((event.clientY - rect.top) / rect.height, 1),
    });
    setRunning(true);
  }

  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <button
          type="button"
          aria-label="Guide flock"
          aria-describedby="flock-guide flock-mapping"
          disabled={!sim}
          className="block w-full touch-none cursor-crosshair bg-white/40 focus-visible:outline-offset-[-3px] dark:bg-black/15"
          onPointerDown={(event) => {
            if (event.button !== 0 || !event.isPrimary) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            guide(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              guide(event);
          }}
          onPointerUp={() => setTarget(null)}
          onPointerCancel={() => setTarget(null)}
          onLostPointerCapture={() => setTarget(null)}
          onBlur={() => setTarget(null)}
          onClick={(event) => {
            if (event.detail === 0) {
              setTarget(target ? null : { x: 0.8, y: 0.5 });
              setRunning(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setTarget(null);
              return;
            }
            const arrows: Record<string, [number, number]> = {
              ArrowLeft: [-0.08, 0],
              ArrowRight: [0.08, 0],
              ArrowUp: [0, -0.08],
              ArrowDown: [0, 0.08],
            };
            const delta = arrows[event.key];
            if (!delta) return;
            event.preventDefault();
            setRunning(true);
            setTarget((prev) => ({
              x: clamp((prev?.x ?? 0.8) + delta[0], 1.6),
              y: clamp((prev?.y ?? 0.5) + delta[1], 1),
            }));
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 640 400"
            className="block w-full"
          >
            <defs>
              <pattern
                id="flock-dots"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="0.9" className="fill-muted/25" />
              </pattern>
            </defs>
            <rect width="640" height="400" fill="url(#flock-dots)" />
            <image
              href={`/apps/flock-samples/${sample.id}.png`}
              x="0"
              y="112"
              width="640"
              height="176"
              opacity="0.13"
              pointerEvents="none"
            />
            <path d={paths[0]} className="fill-link/65" />
            <path d={paths[1]} className="fill-link" />
            <path d={paths[2]} className="fill-heading" />
            {target && (
              <circle
                cx={target.x * 400}
                cy={target.y * 400}
                r="10"
                className="fill-none stroke-heading"
                strokeDasharray="2 4"
              />
            )}
          </svg>
        </button>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-muted/25 px-4 py-3 text-xs sm:grid-cols-3 sm:text-sm">
          <label className="flex flex-col gap-1">
            <span className="flex justify-between text-muted">
              cohesion{" "}
              <span className="text-link">{Math.round(cohesion * 100)}%</span>
            </span>
            <input
              type="range"
              aria-label="Cohesion"
              aria-valuetext={`${Math.round(cohesion * 100)} percent`}
              min="0"
              max="1"
              step="0.01"
              value={cohesion}
              onChange={(e) => setCohesion(e.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="flex justify-between text-muted">
              length <span className="text-link">{grain} ms</span>
            </span>
            <input
              type="range"
              aria-label="Grain length"
              aria-valuetext={`${grain} milliseconds`}
              min="70"
              max="320"
              value={grain}
              onChange={(e) => setGrain(e.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
            <span className="flex justify-between text-muted">
              grains <span className="text-link">{grainsPerSecond}/s</span>
            </span>
            <input
              type="range"
              aria-label="Grains per second"
              aria-valuetext={`${grainsPerSecond} grains per second`}
              min="2"
              max="40"
              step="1"
              value={grainsPerSecond}
              onChange={(e) => setGrainsPerSecond(e.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <label
              htmlFor="flock-sample"
              className="flex items-center gap-2 text-muted max-sm:basis-full"
            >
              sample
              <AppSelect
                id="flock-sample"
                value={sample.id}
                onChange={(event) => {
                  const next = samples[event.target.selectedIndex];
                  setSample(next);
                  if (voice.current) void playSample(next.id);
                  else if (sim) setError("");
                }}
              >
                {samples.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </AppSelect>
            </label>
            <button
              type="button"
              className={buttonClass}
              disabled={!sim}
              onClick={() => {
                sim?.scatter();
                setRunning(true);
              }}
            >
              scatter
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!sim}
              onClick={() => {
                if (running) mute();
                setRunning(!running);
              }}
            >
              {running ? "pause" : "play"}
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!sim}
              aria-label="Sound"
              aria-pressed={sound === "on"}
              onClick={() =>
                voice.current ? mute() : void playSample(sample.id)
              }
            >
              {sound === "loading" ? "loading…" : `sound ${sound}`}
            </button>
          </div>
        </div>
      </div>
      <p id="flock-guide" className="mt-3 text-sm text-muted">
        Hold and drag to gather the flock. Use the arrow keys to guide it, or
        Esc to release.
      </p>
      <p id="flock-mapping" className="mt-2 text-sm text-muted">
        Left to right follows the sample waveform and pans the sound. Higher
        birds sing higher. Each flash marks a grain.
      </p>
      <p className="mt-2 text-xs text-muted">
        Sample ·{" "}
        <a href={sample.source} className="underline underline-offset-2">
          {sample.title} by {sample.artist}
        </a>{" "}
        · CC0
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
