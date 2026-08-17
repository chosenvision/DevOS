"use client";

import * as React from "react";
import { animate } from "framer-motion";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = React.useState(0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const controls = animate(0, value, {
      duration: reducedMotion ? 0 : 0.7,
      ease: "easeOut",
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [value, reducedMotion]);

  return (
    <span className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
