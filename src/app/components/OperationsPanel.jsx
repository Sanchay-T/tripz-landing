"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  alsoOnline,
  heroQuotes,
  justInFeed,
  liveStatus,
  onlinePool,
  recentSaves
} from "@/lib/site-data.mjs";

const ease = [0.2, 0.7, 0.3, 1];

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

function useRotatingIndex(length, intervalMs) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!intervalMs || length <= 1) return;
    const id = setInterval(() => setI((prev) => (prev + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return i;
}

function useTypewriter(text, { enabled = true, speedMs = 22, delayMs = 0 } = {}) {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) return;

    let timeoutId;
    const startTimeout = setTimeout(() => {
      let i = 0;
      const tick = () => {
        i += 1;
        setShown(text.slice(0, i));
        if (i < text.length) {
          timeoutId = setTimeout(tick, speedMs);
        }
      };
      tick();
    }, delayMs);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, [text, enabled, speedMs, delayMs]);

  return { shown, done: shown === text };
}

function useAlsoOnlineRotation(reduced) {
  const [slots, setSlots] = useState(() => alsoOnline.slice(0, 3));
  const cursorRef = useRef({ slotIdx: 0, poolNext: 3 });

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      const { slotIdx, poolNext } = cursorRef.current;
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = onlinePool[poolNext % onlinePool.length];
        return next;
      });
      cursorRef.current = {
        slotIdx: (slotIdx + 1) % 3,
        poolNext: poolNext + 1
      };
    }, 3500);
    return () => clearInterval(id);
  }, [reduced]);

  return slots;
}

function AgentCardContent({ agent, ist, reduced }) {
  const { shown, done } = useTypewriter(agent.quote, {
    enabled: !reduced,
    speedMs: 24,
    delayMs: 350
  });

  return (
    <article className="agent-card">
      <div className="meta">
        <span className="dot" aria-hidden="true" /> Live · {agent.name.split(" ")[0]} on the line · {ist} IST
      </div>
      <p className="quote" aria-label={agent.quote}>
        &ldquo;{shown}
        {!reduced && (
          <span
            className={`caret${done ? " caret-fade" : ""}`}
            aria-hidden="true"
          />
        )}
        {done ? "”" : ""}
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

function AgentCardLive({ ist, reduced }) {
  const idx = useRotatingIndex(heroQuotes.length, reduced ? null : 7000);
  const agent = heroQuotes[idx];

  return (
    <div className="agent-card-rotator">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={agent.initials}
          className="agent-card-frame"
          initial={reduced ? false : { opacity: 0, x: 28, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease }}
        >
          <AgentCardContent agent={agent} ist={ist} reduced={reduced} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JustInFeed({ reduced }) {
  const idx = useRotatingIndex(justInFeed.length, reduced ? null : 5000);
  const update = justInFeed[idx];

  return (
    <div className="ops-justin" aria-live="polite">
      <span className="ops-justin-label">
        <span className="dot" aria-hidden="true" /> Just in
      </span>
      <div className="ops-justin-track">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${update.who}-${idx}`}
            className="ops-justin-row"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: 0.36, ease }}
          >
            <b>{update.who}</b> {update.verb}{" "}
            <span className="subj">{update.subject}</span>
            <span className="ago">{update.ago}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AlsoOnlineList({ reduced }) {
  const slots = useAlsoOnlineRotation(reduced);

  return (
    <div className="ops-online">
      <div className="ops-online-label">
        <span>
          Also online · <b>{liveStatus.expertsOnShift - 1} more experts</b>
        </span>
        <span>EN · HI · MR · TA · KN · TE</span>
      </div>
      {slots.map((agent, i) => (
        <div
          key={`slot-${i}`}
          className="ops-row ops-slot"
          style={{ "--dot-delay": `${i * 0.6}s` }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={agent.initials}
              className="mini-avatar"
              aria-hidden="true"
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.32, ease }}
            >
              {agent.initials}
              <span className="mini-dot" aria-hidden="true" />
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${agent.initials}-name`}
              className="name"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease }}
            >
              {agent.name}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${agent.initials}-city`}
              className="city"
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.32, ease }}
            >
              {agent.city}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function LastSaveBlock({ reduced }) {
  const idx = useRotatingIndex(recentSaves.length, reduced ? null : 4500);
  const save = recentSaves[idx];

  return (
    <div className="ops-save" aria-live="polite">
      <span className="label">Last save</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={save.route}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.32, ease }}
          className="save-body-wrap"
        >
          <span className="body">{save.route}</span>
          <span className="detail">{save.detail}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function OperationsPanel() {
  const reduced = useReducedMotion();
  const ist = useIstClock();

  const container = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.07, delayChildren: 0.12 }
        }
      };

  const item = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } }
      };

  return (
    <motion.aside
      className="ops-panel"
      aria-label="Live operations"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px", amount: 0.1 }}
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
        <AgentCardLive ist={ist} reduced={reduced} />
      </motion.div>

      <motion.div variants={item}>
        <JustInFeed reduced={reduced} />
      </motion.div>

      <motion.div variants={item}>
        <AlsoOnlineList reduced={reduced} />
      </motion.div>

      <motion.div variants={item}>
        <LastSaveBlock reduced={reduced} />
      </motion.div>
    </motion.aside>
  );
}
