import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "react-feather";
import { type Instrument, loadMoons, MoonsPad, type Scene } from "./instrument";

import { bands, OrbitalScene } from "./OrbitalScene";

const arrows: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function Moons() {
  const field = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    index: number;
    pointer: number;
    mode: "move" | "height" | "width";
    startValue: number;
    x: number;
    y: number;
  } | null>(null);
  const voice = useRef<MoonsPad | null>(null);
  const [engine, setEngine] = useState<Instrument>();
  const [scene, setScene] = useState<Scene>([]);
  const [selected, setSelected] = useState(0);
  const speed = Number((scene[selected]?.speed ?? 1).toFixed(2));
  const moving = scene.some((moon) => moon.speed > 0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const mute = useCallback(() => {
    voice.current?.close();
    voice.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMoons(controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted) setEngine(loaded);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("The orbits could not load. Reload to try again.");
      });
    const visibility = () => {
      if (document.hidden) mute();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", mute);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", mute);
      mute();
    };
  }, [mute]);

  const draw = useCallback(
    (seconds: number) => {
      if (!engine) return;
      setScene(engine.frame(seconds, drag.current?.index ?? -1));
      voice.current?.shade(engine.light);
    },
    [engine],
  );

  useEffect(() => {
    if (!engine) return;
    draw(0);
    if (!moving) return;
    let frame = 0,
      previous = performance.now();
    const tick = (time: number) => {
      draw(Math.max(0, Math.min(0.05, (time - previous) / 1000)));
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [engine, moving, draw]);

  async function toggleSound() {
    if (voice.current) return mute();
    if (!engine) return;
    let player: MoonsPad | undefined;
    try {
      player = new MoonsPad(engine);
      voice.current = player;
      await player.start();
      if (player === voice.current) {
        setPlaying(true);
        setError("");
      }
    } catch {
      if (player && player !== voice.current) return;
      mute();
      setError("Sound could not start. Try again.");
    }
  }

  function move(index: number, dx: number, dy: number) {
    if (index === -1) engine?.rotate(dx * 0.006, dy * 0.004);
    else engine?.move(index, dx, dy);
    draw(0);
  }

  function hold(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    let mode: "move" | "height" | "width" = "move";
    if (index >= 0) {
      if (event.altKey) mode = "height";
      else if (event.shiftKey) mode = "width";
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      index,
      pointer: event.pointerId,
      mode,
      startValue: mode === "move" ? 0 : scene[index][mode],
      x: event.clientX,
      y: event.clientY,
    };
    if (index >= 0) setSelected(index);
  }
  function release(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointer === event.pointerId) drag.current = null;
  }
  function follow(event: PointerEvent<HTMLButtonElement>) {
    const held = drag.current;
    if (!held || held.pointer !== event.pointerId || !field.current) return;
    const rect = field.current.getBoundingClientRect();
    const dx = ((event.clientX - held.x) * 640) / rect.width;
    const dy = ((event.clientY - held.y) * 360) / rect.height;
    if (held.mode === "move") {
      move(held.index, dx, dy);
      held.x = event.clientX;
      held.y = event.clientY;
      return;
    }
    if (held.mode === "height")
      engine?.lift(held.index, Math.round(held.startValue - dy));
    else engine?.setWidth(held.index, Math.round(held.startValue + dx));
    draw(0);
  }

  const SoundIcon = playing ? Volume2 : VolumeX;
  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <div
          ref={field}
          className="relative aspect-video bg-white/40 dark:bg-black/15"
        >
          <button
            type="button"
            aria-label="Rotate view"
            aria-describedby="moons-guide"
            disabled={!engine}
            className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing focus-visible:outline-offset-[-3px]"
            onPointerDown={(e) => hold(e, -1)}
            onPointerMove={follow}
            onLostPointerCapture={release}
            onKeyDown={(e) => {
              if (e.key === "Home") {
                e.preventDefault();
                engine?.resetView();
                draw(0);
                return;
              }
              const step = arrows[e.key];
              if (!step) return;
              e.preventDefault();
              move(-1, step[0] * 14, step[1] * 14);
            }}
          />
          {engine && scene.length > 0 && (
            <OrbitalScene scene={scene} engine={engine} selected={selected} />
          )}
          {scene.map((disc) => (
            <button
              key={disc.index}
              type="button"
              aria-label={`Move orbit ${disc.index + 1}`}
              aria-pressed={selected === disc.index}
              onFocus={() => setSelected(disc.index)}
              onClick={() => setSelected(disc.index)}
              aria-describedby="moons-guide"
              style={{
                zIndex:
                  1 + scene.filter((other) => other.depth < disc.depth).length,
                left: `${(disc.x / 640) * 100}%`,
                top: `${(disc.y / 360) * 100}%`,
                width: `${(disc.radius / 320) * 100}%`,
              }}
              className="absolute aspect-square min-w-11 -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab rounded-full active:cursor-grabbing"
              onPointerDown={(e) => hold(e, disc.index)}
              onPointerMove={follow}
              onLostPointerCapture={release}
              onKeyDown={(event) => {
                const direction = arrows[event.key];
                if (!direction) return;
                event.preventDefault();
                const step = event.shiftKey ? 16 : 4;
                move(disc.index, direction[0] * step, direction[1] * step);
              }}
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none flex justify-center bg-white/40 pb-3 dark:bg-black/15"
        >
          <span className="flex h-4 items-end gap-1 border-b border-muted/30">
            {bands.map((x, i) => (
              <span
                key={x}
                className="w-1.5 bg-heading"
                style={{ height: `${100 * (engine?.light[i] ?? 0)}%` }}
              />
            ))}
          </span>
        </div>
        <div className="grid grid-cols-2 items-center gap-x-5 gap-y-3 border-t border-muted/25 px-4 py-3 text-xs sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:text-sm">
          {(["height", "width"] as const).map((parameter) => (
            <label key={parameter} className="flex min-w-0 flex-col gap-1">
              <span className="flex justify-between text-muted">
                orbit {parameter}{" "}
                <span className="text-link">
                  {scene[selected]?.[parameter] ?? "–"}
                </span>
              </span>
              <input
                type="range"
                aria-label={`${parameter === "height" ? "Height" : "Width"} of orbit ${selected + 1}`}
                min={
                  parameter === "height"
                    ? (scene[selected]?.worldRadius ?? 34)
                    : 8
                }
                max={parameter === "height" ? 240 : 320}
                step="1"
                value={
                  scene[selected]?.[parameter] ??
                  (parameter === "height" ? 78 : 98)
                }
                disabled={!engine}
                onChange={(event) => {
                  if (parameter === "height")
                    engine?.lift(selected, event.target.valueAsNumber);
                  else engine?.setWidth(selected, event.target.valueAsNumber);
                  draw(0);
                }}
                className="h-5 w-full accent-link"
              />
            </label>
          ))}
          <label className="flex min-w-0 flex-col gap-1">
            <span className="flex justify-between text-muted">
              orbit {selected + 1} speed{" "}
              <span className="text-link">{speed}×</span>
            </span>
            <input
              type="range"
              aria-label={`Speed of orbit ${selected + 1}`}
              aria-valuetext={speed === 0 ? "Paused" : `${speed} times normal`}
              min="0"
              max="2"
              step="0.05"
              value={speed}
              disabled={!engine}
              onChange={(event) => {
                engine?.setSpeed(selected, event.target.valueAsNumber);
                draw(0);
              }}
              className="h-5 w-full accent-link"
            />
          </label>
          <button
            type="button"
            aria-label="Sound"
            aria-pressed={playing}
            disabled={!engine}
            onClick={toggleSound}
            className="inline-flex min-h-9 items-center justify-self-start gap-2 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50"
          >
            <SoundIcon aria-hidden="true" size={15} /> sound{" "}
            {playing ? "on" : "off"}
          </button>
        </div>
      </div>
      <p id="moons-guide" className="mt-3 text-sm text-muted">
        Turn sound on and drag a moon across the light. Alt-drag up or down to
        change orbit height. Shift-drag right to widen the orbit, or left to
        narrow it. Drag the background to rotate the view.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
