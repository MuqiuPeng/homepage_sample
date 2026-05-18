/**
 * Renders a technical-data-sheet style table — rows are spec keys (defined
 * once at the series level), columns are variants. Server component: works
 * with the bilingual data straight from `getSeriesDetail`.
 *
 * Layout:
 *   - Desktop (md+): traditional table with sticky first column.
 *   - Mobile: collapses into one stacked card per variant for readability.
 *
 * Spec values can be plain strings, bilingual objects, or bilingual lists —
 * `renderSpecValue` normalizes them all.
 */

import type { SpecsRecord, SpecsSchemaEntry, Variant } from "@/lib/db/schema";
import {
  pickI18n,
  renderSpecValue,
  type Locale,
} from "@/lib/i18n-helpers";

type Props = {
  schema: SpecsSchemaEntry[];
  variants: Variant[];
  locale: Locale;
  /** i18n labels — passed from the calling server component so this stays
   *  decoupled from `next-intl`'s hooks (which are client-only). */
  labels: {
    testItems: string;
    testMethod: string;
    unit: string;
  };
};

export function SpecsTable({ schema, variants, locale, labels }: Props) {
  if (schema.length === 0 || variants.length === 0) return null;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-brand-100/60 bg-surface-glass backdrop-blur-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-br from-brand-600 to-brand-800 text-ink-onbrand">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {labels.testItems}
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {labels.testMethod}
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {labels.unit}
              </th>
              {variants.map((v) => (
                <th
                  key={v.id}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {pickI18n(v.nameI18n, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schema.map((row, idx) => (
              <tr
                key={row.key}
                className={
                  idx % 2 === 0
                    ? "bg-surface-card/40"
                    : "bg-transparent"
                }
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left text-ink-strong font-medium whitespace-nowrap border-t border-brand-100/40"
                >
                  {pickI18n(row.label, locale)}
                </th>
                <td className="px-4 py-3 text-ink-muted text-xs whitespace-nowrap border-t border-brand-100/40">
                  {pickI18n(row.test_method ?? null, locale) ?? "/"}
                </td>
                <td className="px-4 py-3 text-ink-muted text-xs whitespace-nowrap border-t border-brand-100/40">
                  {row.unit ?? "/"}
                </td>
                {variants.map((v) => {
                  const specs = v.specs as SpecsRecord;
                  const value = renderSpecValue(specs[row.key], locale);
                  return (
                    <td
                      key={v.id}
                      className="px-4 py-3 text-ink-strong whitespace-nowrap border-t border-brand-100/40"
                    >
                      {value ?? "/"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per variant, all specs stacked */}
      <div className="md:hidden space-y-4">
        {variants.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-brand-100/60 bg-surface-glass backdrop-blur-md overflow-hidden"
          >
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3 text-ink-onbrand">
              <p className="text-base font-semibold">
                {pickI18n(v.nameI18n, locale)}
              </p>
              {v.tagI18n && (
                <p className="text-xs opacity-90 mt-0.5">
                  {pickI18n(v.tagI18n, locale)}
                </p>
              )}
            </div>
            <dl className="divide-y divide-brand-100/40">
              {schema.map((row) => {
                const specs = v.specs as SpecsRecord;
                const value = renderSpecValue(specs[row.key], locale);
                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_auto] gap-3 px-4 py-2.5"
                  >
                    <dt className="text-xs text-ink-muted leading-snug">
                      {pickI18n(row.label, locale)}
                      {row.unit && (
                        <span className="ml-1 text-ink-faint">
                          ({row.unit})
                        </span>
                      )}
                    </dt>
                    <dd className="text-sm text-ink-strong text-right font-medium">
                      {value ?? "/"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
