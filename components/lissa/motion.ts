import { useEffect, useRef, useState } from "react";
import type { Scope } from "./signal";

// All controls travel from zero to one; frequency spans two octaves.
export type Position = { x: number; y: number; z: number; pitch: number };
const initial: Position = { x: 0.4, y: 0.5, z: 0.1, pitch: 0.5 };

function frequencyRatio(value: number) {
  const straight = 0.5 + 2.5 * value;
  // Slow the travel near quarter ratios without locking onto a value.
  return straight - (0.7 * Math.sin(8 * Math.PI * straight)) / (8 * Math.PI);
}

export function tuning({ x, y, z, pitch }: Position) {
  return {
    ratio: frequencyRatio(x),
    depthRatio: frequencyRatio(z),
    frequency: 110 * 4 ** pitch,
    phase: y * Math.PI,
  };
}

export function useScopeMotion(scope?: Scope) {
  const [position, setPosition] = useState(initial);
  const [manual, setManual] = useState(initial);
  const [alive, setAlive] = useState(false);
  const current = useRef(initial);
  const target = useRef(initial);
  const drift = useRef<((dt: number) => Position) | null>(null);
  const frame = useRef(0);
  const last = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function tick(time: number) {
    // Backgrounded tabs resume where they left off.
    const dt = Math.min(0.05, Math.max(0, (time - last.current) / 1000));
    last.current = time;
    const goal = drift.current?.(dt) ?? target.current;
    const prev = current.current;
    const gap = Math.max(
      Math.abs(goal.x - prev.x),
      Math.abs(goal.y - prev.y),
      Math.abs(goal.z - prev.z),
      Math.abs(goal.pitch - prev.pitch),
    );
    const blend = drift.current || gap < 0.00001 ? 1 : -Math.expm1(-dt / 0.055);
    current.current =
      blend === 1
        ? goal
        : {
            x: prev.x + (goal.x - prev.x) * blend,
            y: prev.y + (goal.y - prev.y) * blend,
            z: prev.z + (goal.z - prev.z) * blend,
            pitch: prev.pitch + (goal.pitch - prev.pitch) * blend,
          };
    setPosition(current.current);
    frame.current =
      drift.current || blend < 1 ? requestAnimationFrame(tick) : 0;
  }

  function wake() {
    if (frame.current) return;
    last.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }

  function steer(change: Partial<Position>) {
    target.current = {
      ...(drift.current ? current.current : target.current),
      ...change,
    };
    setManual(target.current);
    drift.current = null;
    setAlive(false);
    wake();
  }

  function toggleAlive() {
    const here = current.current;
    if (drift.current) {
      steer(here);
      return;
    }
    if (!scope) return;
    scope.beginMotion(
      crypto.getRandomValues(new Uint32Array(1))[0],
      here.x,
      here.y,
      here.z,
      here.pitch,
    );
    drift.current = scope.motion;
    setAlive(true);
    wake();
  }

  return {
    position,
    controls: alive ? position : manual,
    alive,
    steer,
    toggleAlive,
  };
}
