"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** No-op since the "plain mode" pass; kept so call sites compile. */
  tilt?: boolean;
  /** No-op since the "plain mode" pass; kept so call sites compile. */
  glow?: boolean;
} & ComponentPropsWithoutRef<"div">;

/**
 * Card surface. Originally a frosted-glass + backdrop-blur + 3D-tilt + glow
 * panel; flattened to a plain solid card with a thin border. The `tilt` and
 * `glow` props are accepted but ignored — kept to avoid touching every
 * existing call site.
 */
export function GlassCard({
  children,
  className,
  tilt: _tilt,
  glow: _glow,
  ...rest
}: Props) {
  void _tilt;
  void _glow;
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-surface-strong bg-surface-card p-6",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
