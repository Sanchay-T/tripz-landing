"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;
const ease = (t) => 1 - Math.pow(1 - t, 3);

function useCountUp(target, decimals = 0, enabled = true, startDelayMs = 0) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    let raf;
    let start;
    const startTimeout = setTimeout(() => {
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
    <div>
      <b>
        {display}
        {suffix}
      </b>
      <span>· {label}</span>
    </div>
  );
}

function StaticStat({ value, label }) {
  return (
    <div>
      <b>{value}</b>
      <span>· {label}</span>
    </div>
  );
}

export default function HeroStats({ startDelayMs = 0 }) {
  const reduced = useReducedMotion();
  return (
    <div className="hero-stats">
      <NumStat
        value={38}
        suffix="s"
        label="Avg pickup"
        animate={!reduced}
        startDelayMs={startDelayMs}
      />
      <StaticStat value="24/7" label="Coverage" />
      <NumStat
        value={9.6}
        decimals={1}
        label="CSAT"
        animate={!reduced}
        startDelayMs={startDelayMs + 180}
      />
    </div>
  );
}
