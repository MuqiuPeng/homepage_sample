"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;

export function RevealOnScroll({
  children,
  delay = 0,
  y = 24,
  className,
  ...rest
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
