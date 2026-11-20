import { useEffect, useRef, useState } from "react";

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

function wander(start: number) {
  let from = start;
  let to = start;
  let elapsed = 0;
  let duration = 0;
  return (dt: number) => {
    if (elapsed >= duration) {
      elapsed -= duration;
      from = to;
      const sweep = Math.random() < 0.24;
      to = sweep
        ? from < 0.5
          ? 0.78 + 0.22 * Math.random()
          : 0.22 * Math.random()
        : Math.random();
      duration = sweep ? 0.7 + 0.7 * Math.random() : 2.8 + 4.5 * Math.random();
    }
    elapsed += dt;
    const u = Math.min(1, elapsed / duration);
    // Zero velocity and acceleration at each join, including the quick sweeps.
    const ease = u * u * u * (10 + u * (-15 + 6 * u));
    return from + (to - from) * ease;
  };
}

export function useScopeMotion() {
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
    const blend = gap < 0.00001 ? 1 : -Math.expm1(-dt / 0.055);
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
    const x = wander(here.x),
      y = wander(here.y),
      z = wander(here.z),
      pitch = wander(here.pitch);
    drift.current = (dt) => ({
      x: x(dt),
      y: y(dt),
      z: z(dt),
      pitch: pitch(dt),
    });
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
