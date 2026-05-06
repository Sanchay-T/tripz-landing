"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  heroQuotes,
  justInFeed,
  liveStatus,
  onlinePool,
  recentSaves
} from "@/lib/site-data.mjs";
import { cn } from "@/lib/cn";

const ease = [0.2, 0.7, 0.3, 1];
const CARD_MS = 5_200;
const FEED_MS = 4_300;
const SAVE_MS = 4_500;
const DEFAULT_IST = "21:30";

function nextIndex(length) {
  return (value) => (value + 1) % length;
}

function useRotator(length, intervalMs) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length < 2) return undefined;
    const id = setInterval(() => setIndex(nextIndex(length)), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);

  return index;
}

function useIstClock() {
  const [ist, setIst] = useState(DEFAULT_IST);

  useEffect(() => {
    const tick = () => {
      setIst(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata"
        })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return ist;
}

function AnimatedSwap({ id, children, className }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ agent, ist }) {
  return (
    <article className="min-h-[230px] border-l-4 border-accent bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70 sm:text-[11px] sm:tracking-[0.22em]">
        <span className="size-2 rounded-full bg-accent ring-4 ring-accent/10" />
        Live · {agent.name.split(" ")[0]} on the line · {ist} IST
      </div>
      <p className="mt-5 max-w-[24rem] text-balance font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
        &ldquo;{agent.quote}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3 text-sm text-ink/60">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          {agent.initials}
        </span>
        <span>
          <b className="font-semibold text-ink">{agent.name}</b> — {agent.role}
        </span>
      </div>
    </article>
  );
}

function MissionRow({ update }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 bg-ink px-5 py-4 text-sm text-white sm:px-6">
      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-live">
          <span className="size-2 rounded-full bg-accent-live" />
          Mission
        </div>
        <p className="truncate">
          <b>{update.who}</b> {update.verb}{" "}
          <em className="text-accent-live">{update.subject}</em>
        </p>
      </div>
      <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 sm:inline">
        {update.ago}
      </span>
    </div>
  );
}

function OnlineRoster({ page }) {
  const visibleAgents = useMemo(() => {
    const start = (page * 3) % onlinePool.length;
    return [0, 1, 2].map((offset) => onlinePool[(start + offset) % onlinePool.length]);
  }, [page]);

  return (
    <div className="bg-field p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70 sm:tracking-[0.28em]">
        <span>
          Also online · <b>{liveStatus.expertsOnShift - 1} more experts</b>
        </span>
        <span className="hidden sm:inline">EN · HI · MR · TA · KN · TE</span>
      </div>
      <div className="grid gap-3">
        {visibleAgents.map((agent) => (
          <div
            key={agent.initials}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm"
          >
            <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {agent.initials}
              <span className="absolute right-0 top-0 size-2 rounded-full bg-accent-live ring-2 ring-field" />
            </span>
            <span className="truncate font-semibold text-ink">{agent.name}</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 sm:inline">
              {agent.city}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaveBlock({ save }) {
  return (
    <div className="bg-white px-5 py-4 sm:px-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-ink/45">
        Last save
      </span>
      <p className="mt-2 font-semibold text-ink">{save.route}</p>
      <p className="text-sm text-ink/55">{save.detail}</p>
    </div>
  );
}

export default function OperationsPanel() {
  const ist = useIstClock();
  const cardIndex = useRotator(heroQuotes.length, CARD_MS);
  const feedIndex = useRotator(justInFeed.length, FEED_MS);
  const saveIndex = useRotator(recentSaves.length, SAVE_MS);
  const rosterPage = useRotator(Math.ceil(onlinePool.length / 3), 3_700);

  return (
    <motion.aside
      className="relative z-10 w-full overflow-hidden border border-ink/10 bg-white shadow-2xl shadow-ink/10"
      aria-label="Live operations"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55 sm:px-6 sm:text-[11px] sm:tracking-[0.24em]">
        <span>
          Fig. 01 · <b className="text-ink">The desk</b>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent ring-4 ring-accent/10" />
          <span className="hidden sm:inline">{ist} IST</span>
        </span>
      </div>

      <AnimatedSwap id={`card-${cardIndex}`} className="min-h-[230px]">
        <AgentCard agent={heroQuotes[cardIndex]} ist={ist} />
      </AnimatedSwap>

      <AnimatedSwap id={`feed-${feedIndex}`} className="min-h-16">
        <MissionRow update={justInFeed[feedIndex]} />
      </AnimatedSwap>

      <AnimatedSwap id={`roster-${rosterPage}`} className="min-h-[178px]">
        <OnlineRoster page={rosterPage} />
      </AnimatedSwap>

      <AnimatedSwap id={`save-${saveIndex}`} className="min-h-[92px]">
        <SaveBlock save={recentSaves[saveIndex]} />
      </AnimatedSwap>
    </motion.aside>
  );
}
