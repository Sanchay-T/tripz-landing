"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.2, 0.7, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } }
};

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
};

const itemFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } }
};

const VIEWPORT = { once: true, margin: "-12% 0px -12% 0px", amount: 0.15 };

export function Reveal({ as = "div", children, delay = 0, className, id, ...props }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduced) {
    const Plain = as;
    return (
      <Plain className={className} id={id} {...props}>
        {children}
      </Plain>
    );
  }

  return (
    <Component
      className={className}
      id={id}
      {...props}
      initial={false}
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease, delay }
        }
      }}
    >
      {children}
    </Component>
  );
}

export function StaggerGroup({ as = "div", children, className, id, ...props }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduced) {
    const Plain = as;
    return (
      <Plain className={className} id={id} {...props}>
        {children}
      </Plain>
    );
  }

  return (
    <Component
      className={className}
      id={id}
      {...props}
      initial={false}
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ as = "div", children, className, ...props }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduced) {
    const Plain = as;
    return <Plain className={className} {...props}>{children}</Plain>;
  }

  return (
    <Component className={className} variants={itemFade} {...props}>
      {children}
    </Component>
  );
}

export { fadeUp, itemFade, staggerParent, ease, VIEWPORT };
