"use client";

import { useEffect, useState } from "react";

// State of each question checkpoint, in order 3, 6, 9, 12 o'clock.
export type Mark = "pending" | "current" | "right" | "wrong";

type Props = {
  marks?: Mark[];
  // 0..1 share of the countdown already used. Omit to show the real time.
  used?: number;
};

const C = 100;
const at = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded so server and browser render identical numbers (avoids hydration mismatch).
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return [round(C + r * Math.cos(a)), round(C + r * Math.sin(a))] as const;
};

function Hand({ deg, from, to, width, className }: { deg: number; from: number; to: number; width: number; className: string }) {
  const [x1, y1] = at(deg, from);
  const [x2, y2] = at(deg, to);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={width} className={className} />;
}

export default function Clock({ marks = ["pending", "pending", "pending", "pending"], used }: Props) {
  // Real time only after mount so server and client render the same first frame (10:10, the catalogue pose).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (used !== undefined) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [used]);

  const h = now ? now.getHours() % 12 + now.getMinutes() / 60 : 10;
  const m = now ? now.getMinutes() + now.getSeconds() / 60 : 10;
  const s = now ? now.getSeconds() : 0;
  const countdown = used !== undefined;
  const sweep = countdown ? Math.min(1, Math.max(0, used)) * 360 : s * 6;

  const dot = at(sweep, 60);

  // Elapsed sector for the countdown, drawn from 12 o'clock clockwise.
  let sector = "";
  if (countdown && sweep > 0) {
    const [x, y] = at(sweep, 84);
    sector = sweep >= 359.9
      ? `M ${C} ${C - 84} A 84 84 0 1 1 ${C - 0.01} ${C - 84} Z`
      : `M ${C} ${C} L ${C} ${C - 84} A 84 84 0 ${sweep > 180 ? 1 : 0} 1 ${x} ${y} Z`;
  }

  return (
    <svg viewBox="0 0 200 200" className="clock" role="img"
      aria-label={countdown ? "Countdown clock" : "Clock showing the current time"}>
      <circle cx={C} cy={C} r={97} className="clock-rim" />
      <circle cx={C} cy={C} r={92} className="clock-face" />
      {sector && <path d={sector} className="clock-sector" />}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 15 === 0) return null; // checkpoints sit on 12, 3, 6, 9
        const big = i % 5 === 0;
        return <Hand key={i} deg={i * 6} from={big ? 74 : 84} to={89} width={big ? 3.2 : 1.2} className="clock-tick" />;
      })}
      {marks.map((state, i) => {
        const [x, y] = at((i + 1) * 90, 76);
        return (
          <g key={i} className={`mark mark-${state}`}>
            <circle cx={x} cy={y} r={11} />
            <text x={x} y={y} dy="0.35em" textAnchor="middle">{(i + 1) * 3}</text>
          </g>
        );
      })}
      {!countdown && <>
        <Hand deg={h * 30} from={-12} to={48} width={7} className="clock-hand" />
        <Hand deg={m * 6} from={-14} to={70} width={5} className="clock-hand" />
      </>}
      <Hand deg={sweep} from={-18} to={60} width={1.8} className="clock-second" />
      <circle cx={dot[0]} cy={dot[1]} r={6} className="clock-second-dot" />
      <circle cx={C} cy={C} r={3} className="clock-second-dot" />
    </svg>
  );
}
