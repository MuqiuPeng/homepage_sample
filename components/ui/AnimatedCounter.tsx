"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Format = "comma" | "plain";

type Props = {
  to: number;
  from?: number;
  duration?: number;
  format?: Format;
  className?: string;
};

function formatValue(value: number, format: Format) {
  const rounded = Math.round(value);
  return format === "plain" ? rounded.toString() : rounded.toLocaleString();
}

export function AnimatedCounter({
  to,
  from = 0,
  duration = 1.6,
  format = "comma",
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const value = useMotionValue(from);
  const display = useTransform(value, (latest) => formatValue(latest, format));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, to, duration, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
