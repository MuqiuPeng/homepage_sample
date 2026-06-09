import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChevronLeft, Tag, Factory, Calendar, Package, Truck, Info, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpecsTable } from "@/components/products/SpecsTable";
import { getAllSeriesParams, getSeriesDetail } from "@/lib/db/queries";
import {
  pickI18n,
  pickI18nList,
  type Locale,
} from "@/lib/i18n-helpers";
import type {
  EngineeringCase,
  I18n,
  I18nList,
  PackageItem,
  SpecsSchemaEntry,
} from "@/lib/db/schema";

// ISR: re-generate at most once every 60s. `dynamicParams = true` lets
// series added to the DB after build render on first request instead of 404.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllSeriesParams();
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string; seriesId: string }>;
}) {
  const { locale, categoryId, seriesId } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations("products");

  const detail = await getSeriesDetail(seriesId);
  if (!detail || detail.series.categoryId !== categoryId) notFound();
  const { series, variants, category } = detail;
  const lc = locale as Locale;

  const seriesName = pickI18n(series.nameI18n as I18n, lc);
  const categoryName = category
    ? pickI18n(category.nameI18n as I18n, lc)
    : null;
  const composition = pickI18n(series.compositionI18n as I18n | null, lc);
  const description = pickI18n(series.descriptionI18n as I18n | null, lc);
  const manufacturer = pickI18n(series.manufacturerI18n as I18n | null, lc);
  const applications = pickI18nList(series.applicationsI18n as I18nList | null, lc);
  const engineeringCases = (series.engineeringCases as EngineeringCase[] | null) ?? [];
  const packaging = (series.packaging as PackageItem[] | null) ?? [];
  const shippingNote = pickI18n(series.shippingNoteI18n as I18n | null, lc);
  const dataDisclaimer = pickI18n(series.dataDisclaimerI18n as I18n | null, lc);
  const specsSchema = (series.specsSchema as SpecsSchemaEntry[]) ?? [];

  return (
    <section className="relative px-4 pt-32 pb-24 sm:px-6 sm:pt-36 sm:pb-32 lg:px-8 lg:pb-40">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-ink-muted hover:text-brand-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {tr("title")}
          </Link>
          <span className="text-ink-faint">/</span>
          <Link
            href={`/products/${categoryId}`}
            className="text-ink-muted hover:text-brand-700 transition-colors"
          >
            {categoryName}
          </Link>
          <span className="text-ink-faint">/</span>
          <span className="text-ink-strong">{seriesName}</span>
        </nav>

        {/* Series header */}
        <GlassCard className="!p-6 sm:!p-8 lg:!p-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              {categoryName}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-strong">
              {seriesName}
            </h1>
            {composition && (
              <p className="text-base text-ink-muted leading-relaxed mt-2">
                <span className="font-medium text-ink-strong">
                  {tr("composition")}：
                </span>
                {composition}
              </p>
            )}
            {description && (
              <p className="text-base text-ink-muted leading-relaxed mt-3">
                {description}
              </p>
            )}
          </div>

          {/* Meta row */}
          <dl className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-brand-100/50 pt-5">
            {manufacturer && (
              <MetaItem
                icon={Factory}
                label={tr("manufacturer")}
                value={manufacturer}
              />
            )}
            {series.sinceYear && (
              <MetaItem
                icon={Calendar}
                label={tr("sinceYear")}
                value={String(series.sinceYear)}
              />
            )}
            <MetaItem
              icon={Tag}
              label={tr("variantsCount")}
              value={String(variants.length)}
            />
            <MetaItem
              icon={Info}
              label={tr("specsCount")}
              value={String(specsSchema.length)}
            />
          </dl>
        </GlassCard>

        {/* Applications + Engineering cases */}
        {(applications.length > 0 || engineeringCases.length > 0) && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {applications.length > 0 && (
              <GlassCard className="!p-6 sm:!p-7">
                <h2 className="text-lg font-semibold text-ink-strong">
                  {tr("applications")}
                </h2>
                <ul className="mt-4 space-y-2">
                  {applications.map((app, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {engineeringCases.length > 0 && (
              <GlassCard className="!p-6 sm:!p-7">
                <h2 className="text-lg font-semibold text-ink-strong">
                  {tr("engineeringCases")}
                </h2>
                <ul className="mt-4 space-y-2">
                  {engineeringCases.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <MapPin
                        className="h-4 w-4 mt-0.5 shrink-0 text-accent-500"
                        strokeWidth={1.8}
                      />
                      <span>{pickI18n(c, lc)}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </div>
        )}

        {/* Specs table */}
        <div className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-strong">
            {tr("specsTitle")}
          </h2>
          <div className="mt-5">
            <SpecsTable
              schema={specsSchema}
              variants={variants}
              locale={lc}
              labels={{
                testItems: tr("testItem"),
                testMethod: tr("testMethod"),
                unit: tr("unit"),
              }}
            />
          </div>
          {dataDisclaimer && (
            <p className="mt-3 text-xs text-ink-faint italic">
              ※ {dataDisclaimer}
            </p>
          )}
        </div>

        {/* Packaging + shipping note */}
        {(packaging.length > 0 || shippingNote) && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {packaging.length > 0 && (
              <GlassCard className="!p-6 sm:!p-7">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-ink-strong">
                  <Package className="h-5 w-5 text-brand-600" strokeWidth={1.8} />
                  {tr("packaging")}
                </h2>
                <ul className="mt-4 space-y-2">
                  {packaging.map((p, i) => (
                    <li key={i} className="text-sm text-ink-muted">
                      {pickI18n(p, lc)}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {shippingNote && (
              <GlassCard className="!p-6 sm:!p-7">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-ink-strong">
                  <Truck className="h-5 w-5 text-brand-600" strokeWidth={1.8} />
                  {tr("shippingNote")}
                </h2>
                <p className="mt-4 text-sm text-ink-muted leading-relaxed">
                  {shippingNote}
                </p>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-200/70 bg-gradient-to-br from-brand-50 to-surface-strong text-brand-700">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-ink-strong">{value}</dd>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string; seriesId: string }>;
}) {
  const { locale, seriesId } = await params;
  const detail = await getSeriesDetail(seriesId);
  if (!detail) return {};
  const name = pickI18n(
    detail.series.nameI18n as I18n,
    locale as Locale,
  );
  const tn = await getTranslations({ locale, namespace: "nav" });
  return { title: `${name} — ${tn("brand")}` };
}
