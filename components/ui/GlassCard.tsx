"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof motion.div>, "children">;

export function GlassCard({
  children,
  className,
  tilt = false,
  glow = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 220,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 18,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    if (!tilt) return;
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
      className={cn(
        "gradient-border relative rounded-2xl border border-surface-strong/60 bg-surface-glass p-6 backdrop-blur-xl shadow-glass",
        glow && "transition-shadow duration-500 hover:shadow-glass-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
