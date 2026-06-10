"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  CATEGORY_VISUAL,
  DEFAULT_VISUAL,
} from "@/components/products/category-visual";
import { cn } from "@/lib/cn";
import { pickI18n, type Locale } from "@/lib/i18n-helpers";

export type HomepageCategory = {
  id: string;
  name: { zh: string; en: string };
  seriesCount: number;
  variantsCount: number;
  sampleSeries: Array<{
    id: string;
    name: { zh: string; en: string };
    summary: { zh: string; en: string } | null;
  }>;
};

/**
 * Collapsible list of a category's series. Collapsed by default so the card
 * stays compact; expands to a two-line list — product code on top, a small
 * grey use-case subtitle below. Lives inside the card's <Link>, so the toggle
 * swallows the click to avoid navigating to the category page.
 */
function SeriesDisclosure({
  label,
  series,
  locale,
}: {
  label: string;
  series: HomepageCategory["sampleSeries"];
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 rounded-2xl border border-brand-100/70 bg-gradient-to-br from-brand-50/60 to-surface-strong/55 p-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          {label}
          <span className="ml-1.5 text-ink-faint">{series.length}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-brand-500 transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2.2}
        />
      </button>

      {open && (
        <ul className="mt-3 flex flex-col divide-y divide-brand-100/60">
          {series.map((s) => {
            const summary = s.summary ? pickI18n(s.summary, locale) : null;
            return (
              <li key={s.id} className="py-2 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-ink-strong">
                  {pickI18n(s.name, locale)}
                </p>
                {summary && (
                  <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-ink-faint">
                    {summary}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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

                    {/* Series — sub-items under the category. Collapsed by
                        default; each row pairs the product code with a small
                        use-case subtitle so a code alone isn't just noise. */}
                    {c.sampleSeries.length > 0 && (
                      <SeriesDisclosure
                        label={t("seriesLabel")}
                        series={c.sampleSeries}
                        locale={locale}
                      />
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
            className="inline-flex items-center gap-2 rounded-md border border-brand-300/60 bg-surface-card px-6 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50/60 hover:border-brand-500 transition-colors"
          >
            {tp("title")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
