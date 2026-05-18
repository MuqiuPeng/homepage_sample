"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Atom,
  FlaskConical,
  Droplets,
  Leaf,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LinkButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { TrustStrip } from "@/components/sections/TrustStrip";

const FLOATING_ICONS = [
  { icon: Atom, top: "10%", left: "6%", delay: 0 },
  { icon: FlaskConical, top: "18%", right: "8%", delay: 0.6 },
  { icon: Droplets, bottom: "20%", left: "10%", delay: 1.2 },
  { icon: Leaf, bottom: "12%", right: "12%", delay: 0.3 },
];

export function Hero() {
  const t = useTranslations("hero");
  const titleText = t("title");
  const titleAccent = t("titleAccent");
  const titleWords = titleText.split(" ");

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-20 pb-6 sm:pt-28 sm:pb-8 lg:pt-32 lg:pb-10 snap-start min-h-svh flex flex-col"
    >
      <div className="flex flex-1 flex-col lg:justify-center">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-8">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-surface-glass px-4 py-1.5 text-xs font-medium text-brand-700 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-500" />
            {t("eyebrow")}
          </motion.div>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-strong sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1 + titleWords.length * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-gradient inline-block"
            >
              {titleAccent}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <LinkButton href="#products" variant="primary" className="px-7 py-3.5">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </LinkButton>
            <LinkButton href="#contact" variant="ghost" className="px-7 py-3.5">
              {t("ctaSecondary")}
            </LinkButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-brand-100/60 pt-6"
          >
            {(["experience", "suppliers", "markets"] as const).map((key) => (
              <div key={key}>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                  {t(`stats.${key}.label`)}
                </dt>
                <dd className="mt-1 text-xl font-semibold text-ink-strong sm:text-2xl">
                  {t(`stats.${key}.value`)}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative h-[420px] sm:h-[520px] lg:h-[560px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <HeroVisual />
          </motion.div>

          {FLOATING_ICONS.map(({ icon: Icon, delay, ...pos }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 + delay, ease: "easeOut" }}
              style={pos as React.CSSProperties}
              className="absolute"
            >
              <GlassCard
                className="!p-3 hover:!shadow-glass-lg"
                style={{ animation: `float 7s ease-in-out infinite ${delay}s` }}
              >
                <Icon className="h-5 w-5 text-brand-600" />
              </GlassCard>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
      <TrustStrip />
    </section>
  );
}

/**
 * Crystalline / molecular lattice visual: a hexagonal benzene ring at center
 * surrounded by orbiting atoms and a soft droplet glow. Pure SVG, no JS.
 */
function HeroVisual() {
  // Hexagon ring (6 vertices) coordinates around center (200, 250), radius 70.
  const cx = 200;
  const cy = 250;
  const r = 78;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

  // Outer satellite atoms — radial extensions
  const outer = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + (r + 90) * Math.cos(a), cy + (r + 90) * Math.sin(a)] as [number, number];
  });

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-6 top-10 bottom-10">
        <div className="relative h-full w-full overflow-hidden rounded-[40px] border border-surface-strong/70 bg-gradient-to-br from-surface-strong/80 via-brand-50/55 to-accent-200/40 shadow-glass-lg backdrop-blur-2xl">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 28% 22%, color-mix(in srgb, var(--color-brand-400) 45%, transparent), transparent 55%), radial-gradient(circle at 72% 78%, color-mix(in srgb, var(--color-accent-400) 32%, transparent), transparent 55%)",
            }}
          />
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 400 500"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="hex-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--color-brand-600)", stopOpacity: 0.85 }} />
                <stop offset="100%" style={{ stopColor: "var(--color-accent-400)", stopOpacity: 0.65 }} />
              </linearGradient>
              <radialGradient id="atom-core" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" style={{ stopColor: "var(--color-brand-600)", stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: "var(--color-brand-600)", stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="atom-gold" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" style={{ stopColor: "var(--color-accent-400)", stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: "var(--color-accent-400)", stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id="bond-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--color-brand-500)", stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: "var(--color-brand-500)", stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>

            {/* Slow rotation group around the molecule */}
            <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "spin 36s linear infinite" }}>
              {/* Bonds from hexagon vertices to outer atoms */}
              {hex.map(([hx, hy], i) => {
                const [ox, oy] = outer[i];
                return (
                  <line
                    key={`bond-${i}`}
                    x1={hx}
                    y1={hy}
                    x2={ox}
                    y2={oy}
                    stroke="url(#bond-line)"
                    strokeWidth="1.2"
                    strokeDasharray="3 6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-18"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}

              {/* Outer satellite atoms */}
              {outer.map(([x, y], i) => (
                <g key={`outer-${i}`}>
                  <circle cx={x} cy={y} r="20" fill={i % 2 === 0 ? "url(#atom-core)" : "url(#atom-gold)"} opacity="0.5" />
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    style={{ fill: "var(--color-surface-strong)", stroke: i % 2 === 0 ? "var(--color-brand-600)" : "var(--color-accent-500)" }}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    style={{ fill: i % 2 === 0 ? "var(--color-brand-600)" : "var(--color-accent-500)" }}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur="2.8s"
                      repeatCount="indefinite"
                      begin={`${i * 0.3}s`}
                    />
                  </circle>
                </g>
              ))}
            </g>

            {/* Stationary central hexagon (benzene ring) */}
            <polygon
              points={hex.map(([x, y]) => `${x},${y}`).join(" ")}
              style={{ fill: "color-mix(in srgb, var(--color-surface-strong) 55%, transparent)" }}
              stroke="url(#hex-stroke)"
              strokeWidth="1.6"
            />
            {/* Inner ring (aromatic representation) */}
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.55}
              fill="none"
              style={{ stroke: "var(--color-brand-600)" }}
              strokeWidth="1"
              strokeOpacity="0.55"
              strokeDasharray="3 4"
            />

            {/* Vertices */}
            {hex.map(([x, y], i) => (
              <g key={`vertex-${i}`}>
                <circle cx={x} cy={y} r="14" fill="url(#atom-core)" opacity="0.45" />
                <circle cx={x} cy={y} r="6" style={{ fill: "var(--color-surface-strong)", stroke: "var(--color-brand-600)" }} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="2.5" style={{ fill: "var(--color-brand-600)" }}>
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.2}s`}
                  />
                </circle>
              </g>
            ))}

            {/* Center atom highlight */}
            <circle cx={cx} cy={cy} r="32" fill="url(#atom-gold)" opacity="0.55" />
            <circle cx={cx} cy={cy} r="9" style={{ fill: "var(--color-surface-strong)", stroke: "var(--color-accent-500)" }} strokeWidth="1.6" />
            <circle cx={cx} cy={cy} r="4" style={{ fill: "var(--color-accent-500)" }}>
              <animate attributeName="r" values="3;5;3" dur="2.6s" repeatCount="indefinite" />
            </circle>

            {/* Decorative droplet at bottom-left */}
            <g transform="translate(70 410)" opacity="0.85">
              <path
                d="M0 0 C 12 -22, 28 -22, 16 -2 Z"
                style={{ fill: "color-mix(in srgb, var(--color-brand-400) 35%, transparent)", stroke: "var(--color-brand-600)" }}
                strokeOpacity="0.5"
                strokeWidth="1"
              />
            </g>
            <g transform="translate(330 90)" opacity="0.85">
              <path
                d="M0 0 C 9 -16, 22 -16, 12 -1 Z"
                style={{ fill: "color-mix(in srgb, var(--color-accent-400) 35%, transparent)", stroke: "var(--color-accent-500)" }}
                strokeOpacity="0.55"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
