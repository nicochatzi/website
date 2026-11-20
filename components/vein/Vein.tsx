import { useTheme } from "next-themes";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "react-feather";
import { drawNetwork, loadNetwork, type Network } from "./network";
import { VeinVoice } from "./voice";

const control =
  "inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50";

export function Vein() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ pointer: number; food: number } | null>(null);
  const voice = useRef<VeinVoice | null>(null);
  const glow = useRef(new Float32Array(8));
  const [network, setNetwork] = useState<Network>();
  const [foods, setFoods] = useState<ReturnType<Network["foods"]>>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const { resolvedTheme } = useTheme();

  const mute = useCallback(() => {
    voice.current?.close();
    voice.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadNetwork(controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setFoods(loaded.foods());
        setNetwork(loaded);
        setRunning(!matchMedia("(prefers-reduced-motion: reduce)").matches);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Vein could not load. Reload to try again.");
      });
    const hide = () => {
      if (document.hidden) mute();
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", mute);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", mute);
      mute();
    };
  }, [mute]);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx || !network || !resolvedTheme) return;
    const style = getComputedStyle(element);
    const ink = style.getPropertyValue("--color-link").trim();
    const light = style.getPropertyValue("--color-heading").trim();
    const draw = () => drawNetwork(ctx, network, glow.current, ink, light);
    const resize = () => {
      const scale = Math.min(devicePixelRatio, 3);
      element.width = Math.max(1, Math.round(element.clientWidth * scale));
      element.height = Math.max(1, Math.round(element.clientHeight * scale));
      draw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    let frame = 0,
      remainder = 0,
      last = performance.now();
    const step = 1 / 60;
    const animate = (now: number) => {
      remainder += Math.min(0.05, (now - last) / 1000);
      last = now;
      while (remainder >= step) {
        network.wasm.tick(step);
        for (const [id, hit] of network.hits.entries()) {
          glow.current[id] *= 0.89;
          if (hit > 0) {
            glow.current[id] = Math.sqrt(hit);
            voice.current?.strike(network, id, hit);
          }
        }
        remainder -= step;
      }
      draw();
      frame = requestAnimationFrame(animate);
    };
    if (running) frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [network, running, resolvedTheme]);

  function place(x: number, y: number) {
    if (!network) return -1;
    const id = network.wasm.add_food(x, y);
    if (id < 0) {
      setError("All eight food points are in use. Move or remove one.");
      return -1;
    }
    glow.current[id] = 0;
    setError("");
    setFoods(network.foods());
    setSelected(id);
    setRunning(true);
    return id;
  }

  function move(id: number, x: number, y: number) {
    if (!network) return;
    network.wasm.move_food(id, x, y);
    setFoods(network.foods());
    setRunning(true);
  }

  function remove(id: number) {
    if (!network) return;
    network.wasm.remove_food(id);
    setFoods(network.foods());
    setSelected(null);
    setError("");
    setRunning(true);
  }

  function position(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (640 * (event.clientX - rect.left)) / rect.width,
      y: (400 * (event.clientY - rect.top)) / rect.height,
    };
  }

  async function toggleSound() {
    if (voice.current) return mute();
    let player: VeinVoice | undefined;
    try {
      player = new VeinVoice();
      voice.current = player;
      await player.start();
      if (voice.current === player) {
        setPlaying(true);
        setRunning(true);
        setError("");
      }
    } catch {
      if (player && voice.current !== player) return;
      mute();
      setError("Sound could not start. Try again.");
    }
  }

  const SoundIcon = playing ? Volume2 : VolumeX;
  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <div
          className="relative aspect-[8/5] touch-none select-none bg-white/40 dark:bg-black/15"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            const food = (event.target as Element).closest<HTMLElement>(
              "[data-food]",
            );
            const p = position(event);
            const id = food ? Number(food.dataset.food) : place(p.x, p.y);
            if (id < 0) return;
            setSelected(id);
            drag.current = { pointer: event.pointerId, food: id };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const active = drag.current;
            if (active?.pointer !== event.pointerId) return;
            const p = position(event);
            move(active.food, p.x, p.y);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
        >
          <button
            type="button"
            aria-label="Place food"
            aria-describedby="vein-guide"
            disabled={!network}
            className="block h-full w-full cursor-crosshair focus-visible:outline-offset-[-3px]"
            onClick={(event) => {
              if (event.detail === 0)
                place(60 + Math.random() * 520, 48 + Math.random() * 304);
            }}
          >
            <canvas ref={canvas} className="block h-full w-full" />
          </button>
          {foods.map(({ id, x, y }) => (
            <button
              key={id}
              data-food={id}
              type="button"
              aria-label={`Food ${id + 1}`}
              aria-pressed={selected === id}
              aria-describedby="vein-guide"
              className="absolute size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing aria-pressed:outline-1 aria-pressed:outline-dashed aria-pressed:outline-link/50 focus-visible:outline-link"
              style={{ left: `${x / 6.4}%`, top: `${y / 4}%` }}
              onFocus={() => setSelected(id)}
              onKeyDown={(event) => {
                const arrows: Record<string, [number, number]> = {
                  ArrowLeft: [-12, 0],
                  ArrowRight: [12, 0],
                  ArrowUp: [0, -12],
                  ArrowDown: [0, 12],
                };
                const delta = arrows[event.key];
                if (delta) {
                  event.preventDefault();
                  move(id, x + delta[0], y + delta[1]);
                } else if (
                  event.key === "Backspace" ||
                  event.key === "Delete"
                ) {
                  event.preventDefault();
                  remove(id);
                }
              }}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-muted/25 px-4 py-3 text-xs sm:text-sm">
          <button
            type="button"
            className={control}
            disabled={!network}
            onClick={() => {
              if (running) mute();
              setRunning(!running);
            }}
          >
            {running ? "pause" : "play"}
          </button>
          <button
            type="button"
            className={control}
            aria-label="Sound"
            aria-pressed={playing}
            disabled={!network}
            onClick={toggleSound}
          >
            <SoundIcon size={15} aria-hidden="true" /> sound{" "}
            {playing ? "on" : "off"}
          </button>
          {selected !== null && (
            <button
              type="button"
              className={`${control} ml-auto`}
              onClick={() => remove(selected)}
            >
              remove food
            </button>
          )}
        </div>
      </div>
      <p id="vein-guide" className="mt-3 text-sm text-muted">
        Tap to place food. Drag a point or use its arrow keys to move it. Each
        pulse plays a note when it reaches food.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
