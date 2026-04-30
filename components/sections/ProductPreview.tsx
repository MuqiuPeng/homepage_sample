"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight } from "lucide-react";

const ITEMS = [
  { key: "a", visualKind: "polymer" },
  { key: "b", visualKind: "liquid" },
  { key: "c", visualKind: "aromatic" },
] as const;

type VisualKind = (typeof ITEMS)[number]["visualKind"];

export function ProductPreview() {
  const t = useTranslations("preview");

  return (
    <section
      id="preview"
      className="relative snap-start min-h-svh flex flex-col lg:justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ITEMS.map(({ key, visualKind }) => (
            <motion.div
              key={key}
              variants={{
                hidden: { opacity: 0, y: 28 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard
                glow
                className="group flex h-full flex-col overflow-hidden !p-0"
              >
                <ProductVisual kind={visualKind} />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-semibold leading-snug text-slate-900">
                    {t(`items.${key}.name`)}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {t(`items.${key}.description`)}
                  </p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-700">
                    {t(`items.${key}.spec`)}
                  </p>
                  <a
                    href="#contact"
                    className="mt-4 inline-flex items-center justify-between rounded-full border border-brand-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-brand-700 transition-all duration-300 hover:border-brand-500 hover:bg-brand-50"
                  >
                    {t(`items.${key}.cta`)}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-10 text-center text-sm text-slate-500">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}

function ProductVisual({ kind }: { kind: VisualKind }) {
  return (
    <div className="relative h-32 w-full overflow-hidden border-b border-white/60 bg-gradient-to-br from-brand-50/70 via-white/60 to-accent-200/40">
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(74,143,165,0.45), transparent 55%), radial-gradient(circle at 70% 70%, rgba(232,163,61,0.32), transparent 55%)",
        }}
      />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {kind === "polymer" && <PolymerPattern />}
        {kind === "liquid" && <LiquidPattern />}
        {kind === "aromatic" && <AromaticPattern />}
      </svg>
    </div>
  );
}

function PolymerPattern() {
  // Repeating linked-chain motif
  return (
    <g stroke="#0f4c5c" strokeOpacity="0.55" strokeWidth="1.4" fill="none">
      {Array.from({ length: 4 }).map((_, row) => (
        <g key={row} transform={`translate(0 ${row * 28 + 14})`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <circle key={i} cx={i * 30 + 12} cy="0" r="6" fill="rgba(255,255,255,0.7)" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`l-${i}`}
              x1={i * 30 + 18}
              y1="0"
              x2={i * 30 + 36}
              y2="0"
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function LiquidPattern() {
  return (
    <g>
      <defs>
        <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b6b7f" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1b6b7f" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M0 60 C 40 40, 80 80, 120 55 S 200 50, 220 65 L 220 100 L 0 100 Z"
        fill="url(#liquid-grad)"
      />
      <path
        d="M0 70 C 50 55, 90 88, 140 68 S 200 65, 220 75 L 220 100 L 0 100 Z"
        fill="rgba(232,163,61,0.18)"
      />
      {[
        [40, 30, 4],
        [90, 22, 3],
        [140, 36, 5],
        [170, 18, 3],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="rgba(255,255,255,0.7)"
          stroke="#1b6b7f"
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />
      ))}
    </g>
  );
}

function AromaticPattern() {
  // Repeating benzene hexagon
  const hexes = [
    [40, 50],
    [90, 30],
    [90, 70],
    [140, 50],
    [180, 30],
  ];
  return (
    <g stroke="#0f4c5c" strokeOpacity="0.6" strokeWidth="1.2" fill="rgba(255,255,255,0.55)">
      {hexes.map(([cx, cy], i) => {
        const r = 16;
        const points = Array.from({ length: 6 }, (_, j) => {
          const a = (Math.PI / 3) * j - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return (
          <g key={i}>
            <polygon points={points} />
            <circle cx={cx} cy={cy} r={r * 0.5} fill="none" strokeDasharray="2 3" />
          </g>
        );
      })}
    </g>
  );
}
