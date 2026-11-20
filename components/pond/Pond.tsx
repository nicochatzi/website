import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppSelect } from "@/components/AppSelect";
import { pickupPositions, type readChord, roots, voicings } from "./chords";
import { contours } from "./contours";
import { Resonators } from "./resonators";
import { loadPond, type Point, type PondEngine } from "./surface";

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
function pointAt(event: PointerEvent, rect: DOMRect): Point {
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height),
  };
}

export function Pond() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const rings = useRef<(HTMLSpanElement | null)[]>([]);
  const sound = useRef<Resonators | null>(null);
  const engine = useRef<PondEngine | null>(null);
  const [chord, setChord] = useState<ReturnType<typeof readChord> | null>(null);
  const [alive, setAlive] = useState(false);
  const swimming = useRef(false);
  const marker = useRef<HTMLSpanElement>(null);
  const startFrames = useRef<(() => void) | null>(null);
  const [audible, setAudible] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [damping, setDamping] = useState(0.32);
  const loss = useRef(damping);
  const [locations, setLocations] = useState<Point[]>(() =>
    pickupPositions.map(({ x, y }) => ({ x, y })),
  );
  const positions = useRef(locations);
  const syncChord = useCallback((pond: PondEngine) => {
    const next = pond.chord();
    sound.current?.tune(next.notes, positions.current);
    setChord(next);
  }, []);
  function chooseChord(root: number, voicing: number) {
    const pond = engine.current;
    if (!pond) return;
    pond.wasm.set_chord(root, voicing);
    syncChord(pond);
  }
  function drop(point: Point) {
    engine.current?.wasm.drop(point.x, point.y, 1);
    startFrames.current?.();
  }
  const wake = useRef<Point | null>(null);
  const grab = useRef<Point | null>(null);
  const mute = useCallback(() => {
    sound.current?.close();
    sound.current = null;
    setAudible(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let frame = 0;
    const visibility = () => {
      if (document.hidden) mute();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", mute);
    async function init() {
      const pond = await loadPond(controller.signal);
      if (controller.signal.aborted || !canvas.current) return;
      const element = canvas.current;
      const ctx = element.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      engine.current = pond;
      for (const [i, p] of positions.current.entries())
        pond.wasm.move_pickup(i, p.x, p.y);
      syncChord(pond);
      let previousTime = 0,
        remainder = 0;
      const dt = 1 / 120;
      function draw(now: number) {
        if (!ctx) return;
        remainder += Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
        previousTime = now;
        let activity = Infinity;
        while (remainder >= dt) {
          remainder -= dt;
          const revision = pond.wasm.chord_revision();
          activity = pond.wasm.tick(loss.current, swimming.current);
          if (revision !== pond.wasm.chord_revision()) syncChord(pond);
          for (const [i, force] of pond.strikes.entries()) {
            if (!force) continue;
            sound.current?.strike(i, force);
            rings.current[i]?.animate([{ opacity: 0.8 }, { opacity: 0 }], {
              duration: 260,
            });
          }
        }
        if (swimming.current && marker.current) {
          marker.current.style.left = `${pond.swimmer[0] * 100}%`;
          marker.current.style.top = `${pond.swimmer[1] * 100}%`;
        }
        if (!swimming.current && activity < 0.0004) {
          pond.wasm.clear();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, element.width, element.height);
          frame = 0;
          return;
        }
        contours(ctx, pond, getComputedStyle(element).color);
        frame = requestAnimationFrame(draw);
      }
      startFrames.current = () => {
        if (!frame) {
          previousTime = performance.now();
          remainder = dt;
          frame = requestAnimationFrame(draw);
        }
      };
      setReady(true);
    }
    init().catch(() => {
      if (!controller.signal.aborted)
        setError("The pond could not load. Reload to try again.");
    });
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      engine.current = null;
      startFrames.current = null;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", mute);
      mute();
    };
  }, [mute, syncChord]);

  async function toggleSound() {
    if (sound.current) {
      mute();
      return;
    }
    if (!engine.current || !chord) return;
    let voice: Resonators | undefined;
    try {
      voice = new Resonators(chord.notes, positions.current, engine.current);
      sound.current = voice;
      await voice.context.resume();
      if (sound.current === voice) {
        setAudible(true);
        setError("");
      }
    } catch {
      if (voice && sound.current !== voice) return;
      mute();
      setError("Sound could not start. Try again.");
    }
  }

  function movePickup(index: number, x: number, y: number) {
    const next = positions.current.slice();
    next[index] = { x: clamp(x, 0.085, 0.915), y: clamp(y, 0.1, 0.84) };
    positions.current = next;
    engine.current?.wasm.move_pickup(index, next[index].x, next[index].y);
    setLocations(next);
    sound.current?.pan(index, next[index].x);
  }

  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <div
          ref={field}
          className="relative aspect-[8/5] bg-white/40 dark:bg-black/15"
        >
          <button
            type="button"
            disabled={!ready}
            aria-label="Drop a stone"
            aria-describedby="pond-guide"
            className="absolute inset-0 block h-full w-full touch-none cursor-crosshair bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-muted)_18%,transparent)_1px,transparent_1px)] bg-size-[24px_24px] focus-visible:outline-offset-[-3px]"
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = pointAt(e, e.currentTarget.getBoundingClientRect());
              wake.current = p;
              drop(p);
            }}
            onPointerMove={(e) => {
              const last = wake.current;
              if (!last || !e.currentTarget.hasPointerCapture(e.pointerId))
                return;
              const p = pointAt(e, e.currentTarget.getBoundingClientRect());
              if (engine.current?.wasm.wake(last.x, last.y, p.x, p.y)) {
                wake.current = p;
                startFrames.current?.();
              }
            }}
            onLostPointerCapture={() => {
              wake.current = null;
            }}
            onClick={(e) => {
              if (e.detail === 0) drop({ x: 0.5, y: 0.5 });
            }}
          >
            <canvas
              ref={canvas}
              className="pointer-events-none block h-full w-full text-link"
            />
          </button>
          <span
            ref={marker}
            aria-hidden="true"
            hidden={!alive}
            className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-heading"
          />
          {chord?.notes.map((pickup, i) => (
            <button
              key={pickupPositions[i].x}
              type="button"
              disabled={!ready}
              aria-label={`Move ${pickup.label} pickup, ${pickup.note}`}
              aria-describedby="pond-guide"
              style={{
                left: `${locations[i].x * 100}%`,
                top: `${locations[i].y * 100}%`,
              }}
              className="absolute flex size-10 -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab items-center justify-center rounded-full text-link active:cursor-grabbing"
              onPointerDown={(e) => {
                if (!e.isPrimary || e.button !== 0 || !field.current) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                const p = pointAt(e, field.current.getBoundingClientRect());
                grab.current = {
                  x: locations[i].x - p.x,
                  y: locations[i].y - p.y,
                };
              }}
              onPointerMove={(e) => {
                if (
                  !grab.current ||
                  !field.current ||
                  !e.currentTarget.hasPointerCapture(e.pointerId)
                )
                  return;
                const p = pointAt(e, field.current.getBoundingClientRect());
                movePickup(i, p.x + grab.current.x, p.y + grab.current.y);
              }}
              onLostPointerCapture={() => {
                grab.current = null;
              }}
              onKeyDown={(e) => {
                const delta: Record<string, [number, number]> = {
                  ArrowLeft: [-0.025, 0],
                  ArrowRight: [0.025, 0],
                  ArrowUp: [0, -0.04],
                  ArrowDown: [0, 0.04],
                };
                const step = delta[e.key];
                if (!step) return;
                e.preventDefault();
                movePickup(
                  i,
                  positions.current[i].x + step[0],
                  positions.current[i].y + step[1],
                );
              }}
            >
              <span
                aria-hidden="true"
                className="grid size-3.5 place-items-center rounded-full border border-current bg-gray-50 dark:bg-gray-925"
              >
                <span className="size-1 rounded-full bg-current" />
              </span>
              <span
                ref={(el) => {
                  rings.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute size-7 rounded-full border border-heading opacity-0"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-[75%] whitespace-nowrap text-xs text-muted"
              >
                {pickup.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-muted/25 px-4 py-3 text-xs sm:text-sm">
          <div className="flex max-w-full items-center gap-2">
            <AppSelect
              aria-label="Chord root"
              disabled={!chord}
              value={chord?.root ?? 7}
              onChange={(e) =>
                chord && chooseChord(Number(e.target.value), chord.voicing)
              }
            >
              {roots.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              aria-label="Chord voicing"
              disabled={!chord}
              value={chord?.voicing ?? 0}
              onChange={(e) =>
                chord && chooseChord(chord.root, Number(e.target.value))
              }
            >
              {voicings.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                  {chord?.voicing === i && chord.bass !== chord.root
                    ? ` / ${roots[chord.bass]}`
                    : ""}
                </option>
              ))}
            </AppSelect>
          </div>
          <label className="flex min-w-28 flex-1 flex-col gap-1">
            <span className="flex justify-between text-muted">
              damping{" "}
              <span className="text-link">{Math.round(damping * 100)}%</span>
            </span>
            <input
              type="range"
              aria-label="Damping"
              aria-valuetext={`${Math.round(damping * 100)} percent`}
              min="0"
              max="100"
              value={Math.round(damping * 100)}
              className="h-5 w-full accent-link"
              onChange={(e) => {
                loss.current = e.target.valueAsNumber / 100;
                setDamping(loss.current);
              }}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!ready}
              aria-label="Alive mode"
              aria-pressed={alive}
              onClick={() => {
                swimming.current = !swimming.current;
                setAlive(swimming.current);
                if (swimming.current) startFrames.current?.();
              }}
              className="min-h-9 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50"
            >
              alive {alive ? "on" : "off"}
            </button>
            <button
              type="button"
              disabled={!ready}
              aria-label="Sound"
              aria-pressed={audible}
              onClick={toggleSound}
              className="min-h-9 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50"
            >
              sound {audible ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>
      <p id="pond-guide" className="mt-3 text-sm text-muted">
        Tap to drop a stone. Drag through the water to leave a wake. Move the
        pickups by dragging or with the arrow keys. Alive leaves a wake and
        changes one pickup note at a time.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
