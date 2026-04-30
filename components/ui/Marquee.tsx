"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode[];
  speed?: number;
  className?: string;
};

export function Marquee({ children, speed = 32, className }: Props) {
  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max gap-12 py-4"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {[...children, ...children].map((child, i) => (
          <div key={i} className="shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
