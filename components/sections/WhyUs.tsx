"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Network,
  FileSearch,
  ShieldCheck,
  Ship,
} from "lucide-react";

const ITEMS = [
  { key: "supply", icon: Network },
  { key: "spec", icon: FileSearch },
  { key: "compliance", icon: ShieldCheck },
  { key: "logistics", icon: Ship },
] as const;

export function WhyUs() {
  const t = useTranslations("whyUs");

  return (
    <section
      id="why-us"
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
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ITEMS.map(({ key, icon: Icon }, i) => (
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
              <GlassCard glow className="group relative h-full overflow-hidden !p-6">
                <span className="absolute right-4 top-4 text-xs font-semibold tracking-[0.18em] text-brand-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-brand-200/70 bg-gradient-to-br from-brand-50 to-surface-strong text-brand-700 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink-strong">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {t(`items.${key}.description`)}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
