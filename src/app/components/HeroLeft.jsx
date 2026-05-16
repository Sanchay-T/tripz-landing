"use client";

import { motion, useReducedMotion } from "motion/react";
import { ctaActions } from "@/lib/site-data.mjs";
import HeroStats from "./HeroStats";
import { Icons } from "./icons";
import { ButtonLink, SectionLabel } from "./ui";

const ease = [0.2, 0.7, 0.3, 1];

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } }
};
const itemV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } }
};

const headlineV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.18 } }
};
const lineV = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease }
  }
};

export default function HeroLeft() {
  const reduced = useReducedMotion();

  const C = reduced ? { hidden: {}, visible: {} } : containerV;
  const I = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : itemV;
  const HC = reduced ? { hidden: {}, visible: {} } : headlineV;
  const HL = reduced
    ? {
        hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" }
      }
    : lineV;

  return (
    <motion.div
      className="flex min-w-0 flex-col items-start gap-5 lg:gap-6"
      initial={false}
      animate="visible"
      variants={C}
    >
      <motion.div variants={I}>
        <SectionLabel>
        Volume 01 · Travel, booked by experts
        </SectionLabel>
      </motion.div>

      <motion.h1
        id="hero-headline"
        className="max-w-[min(14.8ch,100%)] text-balance font-sans text-[clamp(2.85rem,5.8vw,5rem)] font-bold leading-[0.94] tracking-normal text-ink"
        variants={HC}
      >
        <motion.span className="block" variants={HL}>
          Travel experts{" "}
          <em className="block text-accent">by your side.</em>
        </motion.span>
        <motion.span className="block" variants={HL}>
          Better prices,{" "}
          <em className="block text-accent">in your pocket.</em>
        </motion.span>
      </motion.h1>

      <motion.p
        className="max-w-2xl text-pretty text-[clamp(1rem,1vw+0.75rem,1.125rem)] leading-[1.75] text-ink/65"
        variants={I}
      >
        We&rsquo;re <em>human-first</em>, not bot-first. Real travel experts —
        on call 24/7 — for flights, hotels, group bookings, and international
        trips. <em>No AI bots.</em> Just real guidance and better deals.
      </motion.p>

      <motion.div className="flex flex-wrap items-center gap-3" variants={I}>
        <ButtonLink href={ctaActions.call.href}>
          <Icons.phone size={16} />
          {ctaActions.call.label}
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            {ctaActions.call.meta}
          </span>
        </ButtonLink>
      </motion.div>

      <motion.a
        className="inline-flex min-h-10 max-w-full flex-wrap items-center gap-3 border-b border-accent pr-1 font-serif text-xl italic text-ink transition hover:bg-accent-soft"
        href={ctaActions.whatsapp.href}
        target="_blank"
        rel="noreferrer"
        variants={I}
      >
        <span
          className="inline-flex size-7 items-center justify-center rounded-full bg-accent text-white"
          aria-hidden="true"
        >
          <Icons.whatsapp size={13} />
        </span>
        Or message us on WhatsApp
        <span className="font-sans text-base not-italic" aria-hidden="true">
          →
        </span>
      </motion.a>

      <motion.div variants={I} className="w-full max-w-2xl">
        <HeroStats startDelayMs={reduced ? 0 : 1100} />
      </motion.div>
    </motion.div>
  );
}
