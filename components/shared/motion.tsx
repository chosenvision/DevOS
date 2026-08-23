"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades/slides children in. `mode="inView"` triggers on scroll instead of mount — use on
 * below-the-fold marketing sections; leave as "mount" for anything visible on first paint. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  mode = "mount",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  mode?: "mount" | "inView";
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = { hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } };
  const viewProps =
    mode === "inView"
      ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
      : { animate: "show" };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      transition={{ duration: 0.5, delay, ease: EASE }}
      {...viewProps}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Staggers direct `StaggerItem` children in one-by-one. Wrap a grid/list with this and each
 * card/row with `StaggerItem` for a cascading reveal instead of everything popping in at once. */
export function Stagger({
  children,
  className,
  mode = "mount",
}: {
  children: React.ReactNode;
  className?: string;
  mode?: "mount" | "inView";
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const viewProps =
    mode === "inView"
      ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
      : { animate: "show" };

  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" {...viewProps}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Wraps route content so navigating between pages fades/slides the new page in instead of
 * cutting over instantly. Lives in a template.tsx so it remounts (and re-animates) per navigation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
