"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Atom, FlaskConical, Layers } from "lucide-react";

const CATEGORIES = [
  { key: "a", icon: Atom, accent: "from-brand-600 to-brand-800" },
  { key: "b", icon: FlaskConical, accent: "from-brand-500 to-accent-400" },
  { key: "c", icon: Layers, accent: "from-accent-400 to-accent-600" },
] as const;

export function ProductSystem() {
  const t = useTranslations("productSystem");

  return (
    <section
      id="products"
      className="relative snap-start min-h-screen flex flex-col justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <RevealOnScroll key={c.key} delay={i * 0.08} y={32}>
              <GlassCard tilt glow className="group h-full !p-7 sm:!p-8">
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-white shadow-[0_10px_28px_rgba(15,76,92,0.35)]`}
                >
                  <c.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {t(`categories.${c.key}.name`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(`categories.${c.key}.description`)}
                </p>

                <div className="mt-6 rounded-2xl border border-brand-100/70 bg-gradient-to-br from-brand-50/60 to-white/55 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {t("useCasesLabel")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {t(`categories.${c.key}.uses`)}
                  </p>
                </div>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {(["t1", "t2", "t3"] as const).map((tk) => (
                    <li
                      key={tk}
                      className="rounded-full border border-brand-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      {t(`categories.${c.key}.tags.${tk}`)}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
