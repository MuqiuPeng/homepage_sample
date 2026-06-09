"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  CATEGORY_VISUAL,
  DEFAULT_VISUAL,
} from "@/components/products/category-visual";
import { pickI18n, type Locale } from "@/lib/i18n-helpers";

export type HomepageCategory = {
  id: string;
  name: { zh: string; en: string };
  seriesCount: number;
  variantsCount: number;
  sampleSeries: Array<{ id: string; name: { zh: string; en: string } }>;
};

type Props = {
  categories: HomepageCategory[];
};

export function ProductSystem({ categories }: Props) {
  const t = useTranslations("productSystem");
  const tp = useTranslations("products");
  const locale = useLocale() as Locale;

  return (
    <section
      id="products"
      className="relative snap-start min-h-svh flex flex-col lg:justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {categories.map((c, i) => {
            const visual = CATEGORY_VISUAL[c.id] ?? DEFAULT_VISUAL;
            const Icon = visual.icon;
            const name = pickI18n(c.name, locale);

            return (
              <RevealOnScroll key={c.id} delay={i * 0.08} y={32}>
                <Link href={`/products/${c.id}`} className="block h-full group">
                  <GlassCard className="h-full !p-7 sm:!p-8">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${visual.accent} text-ink-onbrand`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-ink-strong">
                      {name}
                    </h3>

                    {/* Counts */}
                    <dl className="mt-3 flex gap-5 text-sm">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
                          {tp("seriesCount")}
                        </dt>
                        <dd className="text-xl font-semibold text-brand-700">
                          {c.seriesCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
                          {tp("variantsCount")}
                        </dt>
                        <dd className="text-xl font-semibold text-brand-700">
                          {c.variantsCount}
                        </dd>
                      </div>
                    </dl>

                    {/* Sample series names */}
                    {c.sampleSeries.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-brand-100/70 bg-gradient-to-br from-brand-50/60 to-surface-strong/55 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                          {t("useCasesLabel")}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {c.sampleSeries.slice(0, 4).map((s) => (
                            <li
                              key={s.id}
                              className="rounded-full border border-brand-200/70 bg-brand-50/60 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                            >
                              {pickI18n(s.name, locale)}
                            </li>
                          ))}
                          {c.sampleSeries.length > 4 && (
                            <li className="rounded-full px-2 py-0.5 text-xs text-ink-faint">
                              +{c.sampleSeries.length - 4}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-all duration-300 group-hover:gap-2">
                      {tp("viewCategory")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </GlassCard>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-brand-300/60 bg-surface-card px-6 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50/60 hover:border-brand-500 transition-colors"
          >
            {tp("title")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
