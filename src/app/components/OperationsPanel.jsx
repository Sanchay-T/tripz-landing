"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  heroQuotes,
  justInFeed,
  liveStatus,
  onlinePool,
  recentSaves
} from "@/lib/site-data.mjs";

const ease = [0.2, 0.7, 0.3, 1];
const CARD_STEP_SECONDS = 5.2;
const FEED_STEP_SECONDS = 4.3;
const SLOT_STEP_SECONDS = 3.5;
const SAVE_STEP_SECONDS = 4.5;

function cycleStyle(index, length, stepSeconds, extra = {}) {
  return {
    "--cycle-delay": `${index * stepSeconds}s`,
    "--cycle-total": `${length * stepSeconds}s`,
    "--cycle-step": `${stepSeconds}s`,
    ...extra
  };
}

function parseAgeSeconds(ago) {
  const value = Number.parseInt(ago, 10);
  if (!Number.isFinite(value)) return 4;
  return ago.includes("m") ? value * 60 : value;
}

function formatAge(seconds) {
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function useIstClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
}

function AgeStack({ ago }) {
  const base = parseAgeSeconds(ago);
  const ticks = [0, 1, 2, 3].map((n) => formatAge(base + n));

  return (
    <span className="ago" aria-label={ticks[0]}>
      <span className="ops-age-stack" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </span>
    </span>
  );
}

function AgentCardContent({ agent, ist }) {
  return (
    <article className="agent-card">
      <div className="meta">
        <span className="dot" aria-hidden="true" /> Live · {agent.name.split(" ")[0]} on the line · {ist} IST
      </div>
      <p className="quote" aria-label={agent.quote}>
        &ldquo;{agent.quote}&rdquo;
      </p>
      <div className="who">
        <span className="avatar">{agent.initials}</span>
        <span>
          <b>{agent.name}</b> — {agent.role}
        </span>
      </div>
    </article>
  );
}

function AgentCardLive({ ist }) {
  return (
    <div className="agent-card-rotator">
      {heroQuotes.map((agent, i) => (
        <div
          key={agent.initials}
          className="agent-card-frame live-card-frame"
          style={cycleStyle(i, heroQuotes.length, CARD_STEP_SECONDS)}
          aria-hidden={i === 0 ? undefined : true}
        >
          <AgentCardContent agent={agent} ist={ist} />
          <span className="ops-card-progress" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function JustInFeed() {
  return (
    <div className="ops-justin" aria-live="polite">
      <span className="ops-justin-label">
        <span className="dot" aria-hidden="true" /> Mission
      </span>
      <div className="ops-justin-track">
        {justInFeed.map((update, i) => (
          <div
            key={`${update.who}-${update.subject}`}
            className="ops-justin-row live-feed-row"
            style={cycleStyle(i, justInFeed.length, FEED_STEP_SECONDS)}
            aria-hidden={i === 0 ? undefined : true}
          >
            <b>{update.who}</b> {update.verb}{" "}
            <span className="subj">{update.subject}</span>
            <AgeStack ago={update.ago} />
          </div>
        ))}
      </div>
    </div>
  );
}

function slotGroups() {
  return [0, 1, 2].map((slot) =>
    onlinePool.filter((_, i) => i % 3 === slot)
  );
}

function AlsoOnlineList() {
  const groups = slotGroups();

  return (
    <div className="ops-online">
      <div className="ops-online-label">
        <span>
          Also online · <b>{liveStatus.expertsOnShift - 1} more experts</b>
        </span>
        <span>EN · HI · MR · TA · KN · TE</span>
      </div>
      {groups.map((agents, slotIndex) => (
        <div key={`slot-${slotIndex}`} className="ops-row ops-slot">
          {agents.map((agent, i) => (
            <div
              key={agent.initials}
              className="ops-slot-agent"
              style={cycleStyle(i, agents.length, SLOT_STEP_SECONDS, {
                "--dot-delay": `${slotIndex * 0.6}s`
              })}
              aria-hidden={i === 0 ? undefined : true}
            >
              <span className="mini-avatar" aria-hidden="true">
                {agent.initials}
                <span className="mini-dot" aria-hidden="true" />
              </span>
              <span className="name">{agent.name}</span>
              <span className="city">{agent.city}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function LastSaveBlock() {
  return (
    <div className="ops-save" aria-live="polite">
      <span className="label">Last save</span>
      <div className="ops-save-track">
        {recentSaves.map((save, i) => (
          <div
            key={save.route}
            className="save-body-wrap live-save-row"
            style={cycleStyle(i, recentSaves.length, SAVE_STEP_SECONDS)}
            aria-hidden={i === 0 ? undefined : true}
          >
            <span className="body">{save.route}</span>
            <span className="detail">{save.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OperationsPanel() {
  const ist = useIstClock();

  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.12 }
    }
  };

  const item = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } }
  };

  return (
    <motion.aside
      className="ops-panel"
      aria-label="Live operations"
      initial={false}
      animate="visible"
      variants={container}
    >
      <motion.div className="ops-strip" variants={item}>
        <span>
          Fig. 01 · <b>The desk</b>
        </span>
        <span className="ops-clock">
          <span className="ops-clock-dot" aria-hidden="true" />
          {ist} IST
        </span>
      </motion.div>

      <motion.div variants={item} className="ops-card-slot">
        <AgentCardLive ist={ist} />
      </motion.div>

      <motion.div variants={item}>
        <JustInFeed />
      </motion.div>

      <motion.div variants={item}>
        <AlsoOnlineList />
      </motion.div>

      <motion.div variants={item}>
        <LastSaveBlock />
      </motion.div>
    </motion.aside>
  );
}
