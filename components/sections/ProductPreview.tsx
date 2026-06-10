"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { pickI18n, type Locale } from "@/lib/i18n-helpers";

export type FeaturedVariant = {
  variantId: string;
  variantName: { zh: string; en: string };
  variantTag: { zh: string; en: string } | null;
  seriesId: string;
  seriesName: { zh: string; en: string };
  seriesComposition: { zh: string; en: string } | null;
  categoryId: string;
  categoryName: { zh: string; en: string };
};

type Props = {
  variants: FeaturedVariant[];
};

type VisualKind = "polymer" | "liquid" | "aromatic";

function visualKindForCategory(catId: string): VisualKind {
  switch (catId) {
    case "fluororesin":
      return "liquid";
    case "fluoroelastomer":
    case "fluorine-fine-chemicals":
      return "aromatic";
    case "pvdf":
    case "ptfe":
    case "fep":
    case "pfa":
    default:
      return "polymer";
  }
}

export function ProductPreview({ variants }: Props) {
  const t = useTranslations("preview");
  const tp = useTranslations("products");
  const locale = useLocale() as Locale;

  return (
    <section
      id="preview"
      className="relative snap-start min-h-svh flex flex-col lg:justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-20"
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
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {variants.map((v) => {
            const kind = visualKindForCategory(v.categoryId);
            const tagText = v.variantTag
              ? pickI18n(v.variantTag, locale)
              : pickI18n(v.seriesComposition, locale);

            return (
              <motion.div
                key={v.variantId}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <Link
                  href={`/products/${v.categoryId}/${v.seriesId}`}
                  className="block h-full group"
                >
                  <GlassCard className="flex h-full flex-col overflow-hidden !p-0">
                    <ProductVisual kind={kind} />
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                        {pickI18n(v.categoryName, locale)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-ink-strong">
                        {pickI18n(v.variantName, locale)}
                      </h3>
                      <p className="mt-1 text-xs text-ink-muted">
                        {pickI18n(v.seriesName, locale)}
                      </p>
                      {tagText && (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                          {tagText}
                        </p>
                      )}
                      <span className="mt-auto pt-4 inline-flex items-center justify-between rounded-md border border-brand-200/70 bg-brand-50/60 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors duration-200 group-hover:border-brand-500 group-hover:bg-brand-50">
                        {tp("viewVariant")}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-10 text-center text-sm text-ink-subtle">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}

function ProductVisual({ kind }: { kind: VisualKind }) {
  return (
    <div className="relative h-32 w-full overflow-hidden border-b border-surface-strong/60 bg-gradient-to-br from-brand-50/70 via-surface-strong/60 to-accent-200/40">
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-brand-400) 45%, transparent), transparent 55%), radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--color-accent-400) 32%, transparent), transparent 55%)",
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
  return (
    <g
      style={{ stroke: "var(--color-brand-600)" }}
      strokeOpacity="0.55"
      strokeWidth="1.4"
      fill="none"
    >
      {Array.from({ length: 4 }).map((_, row) => (
        <g key={row} transform={`translate(0 ${row * 28 + 14})`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <circle
              key={i}
              cx={i * 30 + 12}
              cy="0"
              r="6"
              style={{
                fill: "color-mix(in srgb, var(--color-surface-strong) 70%, transparent)",
              }}
            />
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
          <stop
            offset="0%"
            style={{ stopColor: "var(--color-brand-500)", stopOpacity: 0.28 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--color-brand-500)", stopOpacity: 0.55 }}
          />
        </linearGradient>
      </defs>
      <path
        d="M0 60 C 40 40, 80 80, 120 55 S 200 50, 220 65 L 220 100 L 0 100 Z"
        fill="url(#liquid-grad)"
      />
      <path
        d="M0 70 C 50 55, 90 88, 140 68 S 200 65, 220 75 L 220 100 L 0 100 Z"
        style={{
          fill: "color-mix(in srgb, var(--color-accent-400) 18%, transparent)",
        }}
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
          style={{
            fill: "color-mix(in srgb, var(--color-surface-strong) 70%, transparent)",
            stroke: "var(--color-brand-500)",
          }}
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />
      ))}
    </g>
  );
}

function AromaticPattern() {
  const hexes = [
    [40, 50],
    [90, 30],
    [90, 70],
    [140, 50],
    [180, 30],
  ];
  return (
    <g
      style={{
        stroke: "var(--color-brand-600)",
        fill: "color-mix(in srgb, var(--color-surface-strong) 55%, transparent)",
      }}
      strokeOpacity="0.6"
      strokeWidth="1.2"
    >
      {hexes.map(([cx, cy], i) => {
        const r = 16;
        const points = Array.from({ length: 6 }, (_, j) => {
          const a = (Math.PI / 3) * j - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return (
          <g key={i}>
            <polygon points={points} />
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.5}
              fill="none"
              strokeDasharray="2 3"
            />
          </g>
        );
      })}
    </g>
  );
}
