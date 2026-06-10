"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("hero");
  const titleText = t("title");
  const titleAccent = t("titleAccent");
  const titleWords = titleText.split(" ");

  return (
    // Hero, flattened single-column version: eyebrow / title / description /
    // CTAs / stats. The previous two-column layout had a decorative molecular
    // SVG + 4 floating chemistry icons in the right column — pulled out per
    // the "plain mode" pass so the panel reads as a B2B company intro
    // rather than a tech-startup landing.
    //
    // Sizing budget at 1440×900: header 72 + pt-24 96 + content + pb-8 32.
    // Inner flex-1 + lg:justify-center vertically centres the text block.
    <section
      id="hero"
      className="relative overflow-hidden pt-20 pb-6 sm:pt-24 sm:pb-7 lg:pt-24 lg:pb-8 snap-start min-h-svh flex flex-col"
    >
      <div className="flex flex-1 flex-col lg:justify-center">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center rounded-md border border-brand-200/70 bg-brand-50/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-700"
          >
            {t("eyebrow")}
          </motion.div>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-strong sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
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
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted"
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
            className="mt-7 flex flex-wrap items-center gap-4"
          >
            <LinkButton href="#products" variant="primary" className="px-6 py-3">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </LinkButton>
            <LinkButton href="#contact" variant="ghost" className="px-6 py-3">
              {t("ctaSecondary")}
            </LinkButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
            className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-brand-100/60 pt-5"
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
      </div>
    </section>
  );
}
