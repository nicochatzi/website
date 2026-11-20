import { useTheme } from "next-themes";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Volume2, VolumeX } from "react-feather";
import { InstrumentVoice } from "@/lib/instrumentVoice";
import { drawPlate, loadPlate, type Plate } from "./plate";

const control =
  "inline-flex min-h-9 items-center gap-2 rounded border border-muted/40 px-3 text-link hover:border-link aria-pressed:border-link disabled:opacity-50";
const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

function noteName(midi: number) {
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

export function Chladni() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const voice = useRef<InstrumentVoice | null>(null);
  const [plate, setPlate] = useState<Plate>();
  const [alive, setAlive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [target, setTarget] = useState(0);
  const [hz, setHz] = useState(0);
  const [error, setError] = useState("");
  const { resolvedTheme } = useTheme();
  const mute = useCallback(() => {
    voice.current?.close();
    voice.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPlate(controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setAlive(!matchMedia("(prefers-reduced-motion: reduce)").matches);
        setPlate(loaded);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("The plate could not load. Reload to try again.");
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

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx || !plate) return;
    const ink = resolvedTheme === "dark" ? "#e5cf9e" : "#73583d";
    let previous = performance.now();
    let previousHz = 0;
    let frame = 0;
    const resize = () => {
      const size = Math.max(
        1,
        Math.round(element.clientWidth * Math.min(devicePixelRatio, 3)),
      );
      element.width = element.height = size;
      drawPlate(ctx, plate.grains, ink);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const tick = (now: number) => {
      const frequency = plate.wasm.advance((now - previous) / 1000, alive);
      previous = now;
      setTarget(plate.wasm.selected());
      if (frequency !== previousHz) {
        drawPlate(ctx, plate.grains, ink);
        voice.current?.tune([frequency, 0, 0, 0]);
        setHz(Math.round(frequency));
        previousHz = frequency;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [plate, alive, resolvedTheme]);

  function choose(index: number) {
    if (!plate) return;
    setAlive(false);
    plate.wasm.select(index);
    setTarget(plate.wasm.selected());
  }
  function steer(event: PointerEvent<HTMLCanvasElement>) {
    if (!plate) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    choose(Math.round(x * (plate.wasm.note_count() - 1)));
  }
  async function toggleSound() {
    if (voice.current) return mute();
    if (!plate) return;
    let player: InstrumentVoice | undefined;
    try {
      player = new InstrumentVoice("chladni", [
        plate.wasm.advance(0, alive),
        0,
        0,
        0,
      ]);
      voice.current = player;
      await player.start();
      if (voice.current === player) {
        setPlaying(true);
        setError("");
      }
    } catch {
      if (player && voice.current !== player) return;
      mute();
      setError("Sound could not start. Try again.");
    }
  }
  const SoundIcon = playing ? Volume2 : VolumeX;
  const name = plate ? noteName(plate.wasm.note(target)) : "–";
  return (
    <div>
      <div className="overflow-hidden rounded border border-muted/35">
        <div className="flex justify-center bg-white/40 dark:bg-black/15">
          <canvas
            ref={canvas}
            width="448"
            height="448"
            role="img"
            aria-label="Sand tracing the nodal lines of a vibrating square plate"
            className="block aspect-square h-auto w-full max-w-md touch-none cursor-crosshair"
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              steer(e);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) steer(e);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-muted/25 px-4 py-3 text-xs sm:text-sm">
          <label className="flex min-w-36 flex-1 flex-col gap-1 text-muted">
            <span className="flex justify-between gap-2">
              note{" "}
              <span className="text-link">
                {name} <span className="text-muted">· {hz || "–"} Hz</span>
              </span>
            </span>
            <input
              type="range"
              min="0"
              max={(plate?.wasm.note_count() ?? 1) - 1}
              value={target}
              step="1"
              disabled={!plate}
              aria-label="Plate note"
              aria-valuetext={name}
              onChange={(e) => choose(e.target.valueAsNumber)}
              className="h-5 w-full accent-link"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Alive mode"
              aria-pressed={alive}
              className={control}
              disabled={!plate}
              onClick={() => setAlive((v) => !v)}
            >
              <Activity size={15} aria-hidden="true" /> alive{" "}
              {alive ? "on" : "off"}
            </button>
            <button
              type="button"
              aria-label="Sound"
              aria-pressed={playing}
              className={control}
              disabled={!plate}
              onClick={toggleSound}
            >
              <SoundIcon size={15} aria-hidden="true" /> sound{" "}
              {playing ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        Drag across the plate to choose a note. Turn on alive to let the sand
        move between resonances.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-heading">
          {error}
        </p>
      )}
    </div>
  );
}
