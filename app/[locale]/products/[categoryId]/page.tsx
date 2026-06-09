import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ChevronLeft, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getAllCategoryIds,
  getCategory,
  getSeriesInCategory,
} from "@/lib/db/queries";
import { pickI18n, pickI18nList, type Locale } from "@/lib/i18n-helpers";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await getAllCategoryIds();
  return ids.map((id) => ({ categoryId: id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string }>;
}) {
  const { locale, categoryId } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations("products");

  const category = await getCategory(categoryId);
  if (!category) notFound();
  const seriesList = await getSeriesInCategory(categoryId);

  const lc = locale as Locale;
  const categoryName = pickI18n(
    category.nameI18n as { zh: string; en: string },
    lc,
  );

  return (
    <section className="relative px-4 pt-32 pb-24 sm:px-6 sm:pt-36 sm:pb-32 lg:px-8 lg:pb-40">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-ink-muted hover:text-brand-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {tr("title")}
          </Link>
          <span className="text-ink-faint">/</span>
          <span className="text-ink-strong">{categoryName}</span>
        </nav>

        <SectionHeading
          align="left"
          eyebrow={tr("categoryEyebrow")}
          title={categoryName ?? ""}
          description={tr("categoryDescription", {
            count: seriesList.length,
          })}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((s) => {
            const seriesName = pickI18n(
              s.nameI18n as { zh: string; en: string },
              lc,
            );
            const composition = pickI18n(
              s.compositionI18n as { zh: string; en: string } | null,
              lc,
            );
            const applications = pickI18nList(
              s.applicationsI18n as { zh: string[]; en: string[] } | null,
              lc,
            );

            return (
              <Link
                key={s.id}
                href={`/products/${categoryId}/${s.id}`}
                className="group block"
              >
                <GlassCard className="h-full !p-6 sm:!p-7">
                  <h3 className="text-lg font-semibold text-ink-strong leading-snug">
                    {seriesName}
                  </h3>

                  {composition && (
                    <p className="mt-3 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {composition}
                    </p>
                  )}

                  {applications.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {applications.slice(0, 3).map((app, i) => (
                        <li
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full border border-brand-200/60 bg-brand-50/40 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                        >
                          <Tag className="h-2.5 w-2.5" strokeWidth={2.2} />
                          {app}
                        </li>
                      ))}
                      {applications.length > 3 && (
                        <li className="rounded-full px-2 py-0.5 text-[11px] text-ink-faint">
                          +{applications.length - 3}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-5 flex items-end justify-between border-t border-brand-100/40 pt-4">
                    <p className="text-xs text-ink-subtle">
                      <span className="text-2xl font-semibold text-brand-700">
                        {s.variantCount}
                      </span>{" "}
                      {tr("variantsCount")}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-all duration-300 group-hover:gap-1.5">
                      {tr("viewSeries")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        {seriesList.length === 0 && (
          <p className="mt-12 text-center text-ink-muted">
            {tr("noSeriesYet")}
          </p>
        )}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string }>;
}) {
  const { locale, categoryId } = await params;
  const category = await getCategory(categoryId);
  if (!category) return {};
  const name = pickI18n(
    category.nameI18n as { zh: string; en: string },
    locale as Locale,
  );
  const tn = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${name} — ${tn("brand")}`,
  };
}
