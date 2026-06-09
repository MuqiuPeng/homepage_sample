"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BatteryCharging,
  Cpu,
  CarFront,
  Paintbrush,
  Building2,
  Plane,
} from "lucide-react";

// Keys match `industries.items.<key>.*` in the messages catalog. Each item
// represents one downstream market segment that consumes our fluoropolymer
// products — chosen so the six cards collectively cover the main demand
// drivers (lithium / semi / automotive / coatings / construction / aerospace)
// without overlap.
const INDUSTRIES = [
  { key: "batteries", icon: BatteryCharging },
  { key: "semiconductor", icon: Cpu },
  { key: "automotive", icon: CarFront },
  { key: "coatings", icon: Paintbrush },
  { key: "construction", icon: Building2 },
  { key: "aerospace", icon: Plane },
] as const;

export function Industries() {
  const t = useTranslations("industries");

  return (
    <section
      id="industries"
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
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INDUSTRIES.map(({ key, icon: Icon }) => (
            <motion.div
              key={key}
              variants={{
                hidden: { opacity: 0, y: 28 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <GlassCard
                glow
                className="group relative h-full overflow-hidden !p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-brand-300/40 to-accent-300/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-brand-200/70 bg-gradient-to-br from-brand-50 to-surface-strong text-brand-600 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="relative mt-4 text-base font-semibold text-ink-strong">
                  {t(`items.${key}.name`)}
                </h3>
                <p className="relative mt-1.5 text-sm leading-snug text-ink-muted">
                  {t(`items.${key}.use`)}
                </p>
                <ul className="relative mt-3 flex flex-wrap gap-1.5">
                  {(["t1", "t2", "t3"] as const).map((tk) => (
                    <li
                      key={tk}
                      className="rounded-full border border-brand-200/60 bg-surface-glass px-2.5 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {t(`items.${key}.tags.${tk}`)}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
