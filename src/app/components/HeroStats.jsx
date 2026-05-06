"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;
const ease = (t) => 1 - Math.pow(1 - t, 3);

function useCountUp(target, decimals = 0, enabled = true, startDelayMs = 0) {
  const [value, setValue] = useState(target);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    let raf;
    let start;
    const startTimeout = setTimeout(() => {
      setValue(0);
      const step = (ts) => {
        if (start === undefined) start = ts;
        const t = Math.min((ts - start) / DURATION_MS, 1);
        setValue(target * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, enabled, startDelayMs]);

  const factor = 10 ** decimals;
  return (Math.round(value * factor) / factor).toFixed(decimals);
}

function NumStat({ value, decimals = 0, suffix = "", label, animate = true, startDelayMs = 0 }) {
  const display = useCountUp(value, decimals, animate, startDelayMs);
  return (
    <div className="min-w-0">
      <b className="font-mono text-sm font-bold tracking-[0.08em] text-ink">
        {display}
        {suffix}
      </b>
      <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">
        · {label}
      </span>
    </div>
  );
}

function StaticStat({ value, label }) {
  return (
    <div className="min-w-0">
      <b className="font-mono text-sm font-bold tracking-[0.08em] text-ink">
        {value}
      </b>
      <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">
        · {label}
      </span>
    </div>
  );
}

export default function HeroStats({ startDelayMs = 0 }) {
  const reduced = false;
  return (
    <div className="grid w-full grid-cols-1 gap-3 border-t border-ink/10 pt-5 sm:grid-cols-3 sm:gap-4">
      <NumStat
        value={38}
        suffix="s"
        label="Avg pickup"
        animate={!reduced}
        startDelayMs={startDelayMs}
      />
      <StaticStat value="24/7" label="365 days" />
      <NumStat
        value={10}
        label="Experts on shift"
        animate={!reduced}
        startDelayMs={startDelayMs + 180}
      />
    </div>
  );
}
