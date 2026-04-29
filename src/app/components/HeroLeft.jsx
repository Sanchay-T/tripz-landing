"use client";

import { motion, useReducedMotion } from "motion/react";
import { ctaActions } from "@/lib/site-data.mjs";
import HeroStats from "./HeroStats";
import { Icons } from "./icons";

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
      className="hero-left"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px", amount: 0.15 }}
      variants={C}
    >
      <motion.span className="eyebrow hero-eyebrow" variants={I}>
        Volume 01 · Travel, booked by experts
      </motion.span>

      <motion.h1
        id="hero-headline"
        className="hero-headline"
        variants={HC}
      >
        <motion.span className="line" variants={HL}>
          Travel experts{" "}
          <em className="breath breath-a">by your side.</em>
        </motion.span>
        <motion.span className="line" variants={HL}>
          Better prices,{" "}
          <em className="breath breath-b">in your pocket.</em>
        </motion.span>
      </motion.h1>

      <motion.p className="hero-lede" variants={I}>
        We&rsquo;re <em>human-first</em>, not bot-first. Real travel experts —
        on call 24/7 — for flights, hotels, group bookings, and international
        trips. <em>No AI bots.</em> Just real guidance and better deals.
      </motion.p>

      <motion.div className="hero-ctas" variants={I}>
        <a className="cta primary" href={ctaActions.call.href}>
          <Icons.phone size={16} />
          {ctaActions.call.label}
          <span className="meta">{ctaActions.call.meta}</span>
        </a>
      </motion.div>

      <motion.a
        className="hero-aside-cta"
        href={ctaActions.whatsapp.href}
        target="_blank"
        rel="noreferrer"
        variants={I}
      >
        <span className="badge" aria-hidden="true">
          <Icons.whatsapp size={13} />
        </span>
        Or message us on WhatsApp
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </motion.a>

      <motion.div variants={I} style={{ width: "100%" }}>
        <HeroStats startDelayMs={reduced ? 0 : 1100} />
      </motion.div>
    </motion.div>
  );
}
