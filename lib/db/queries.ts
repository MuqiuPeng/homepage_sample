/**
 * Read-side queries for the product catalog. Server-only — call from server
 * components, route handlers, or scripts. Never from client components.
 */

import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import type { Series, Variant } from "@/lib/db/schema";

const { categories, series, variants } = schema;

// ---------- Categories ----------------------------------------------------

export type CategoryWithCounts = {
  id: string;
  name: { zh: string; en: string };
  sortOrder: number;
  seriesCount: number;
  variantsCount: number;
};

/**
 * Categories with the number of (published) series and variants under each.
 * Sorted by `sortOrder` then by id for stable ordering.
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.nameI18n,
      sortOrder: categories.sortOrder,
      seriesCount: sql<number>`COUNT(DISTINCT ${series.id})::int`,
      variantsCount: sql<number>`COUNT(${variants.id})::int`,
    })
    .from(categories)
    .leftJoin(
      series,
      and(eq(series.categoryId, categories.id), eq(series.isPublished, true)),
    )
    .leftJoin(
      variants,
      and(eq(variants.seriesId, series.id), eq(variants.isPublished, true)),
    )
    .groupBy(categories.id, categories.nameI18n, categories.sortOrder)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
  return rows.map((r) => ({
    id: r.id,
    name: r.name as { zh: string; en: string },
    sortOrder: r.sortOrder,
    seriesCount: r.seriesCount,
    variantsCount: r.variantsCount,
  }));
}

/** Single category by id, or null. */
export async function getCategory(id: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---------- Series --------------------------------------------------------

export type SeriesWithVariantSummary = Series & {
  variantCount: number;
  /** First few variants, used as a preview list — full list of names. */
  variantNames: Array<{ id: string; name: { zh: string; en: string } }>;
};

/**
 * All series in a category, each with its variant count and a short list of
 * the first variants' display names (for the series card preview).
 */
export async function getSeriesInCategory(
  categoryId: string,
): Promise<SeriesWithVariantSummary[]> {
  const seriesRows = await db
    .select()
    .from(series)
    .where(and(eq(series.categoryId, categoryId), eq(series.isPublished, true)))
    .orderBy(asc(series.sortOrder), asc(series.id));

  if (seriesRows.length === 0) return [];

  // Fetch variant summaries for all these series in one query
  const variantRows = await db
    .select({
      id: variants.id,
      seriesId: variants.seriesId,
      name: variants.nameI18n,
      sortOrder: variants.sortOrder,
    })
    .from(variants)
    .where(eq(variants.isPublished, true))
    .orderBy(asc(variants.sortOrder));

  const variantsBySeries = new Map<
    string,
    Array<{ id: string; name: { zh: string; en: string } }>
  >();
  for (const v of variantRows) {
    if (!variantsBySeries.has(v.seriesId)) {
      variantsBySeries.set(v.seriesId, []);
    }
    variantsBySeries
      .get(v.seriesId)!
      .push({ id: v.id, name: v.name as { zh: string; en: string } });
  }

  return seriesRows.map((s) => {
    const vs = variantsBySeries.get(s.id) ?? [];
    return { ...s, variantCount: vs.length, variantNames: vs };
  });
}

// ---------- Series detail (with all variants) -----------------------------

export type SeriesDetail = {
  series: Series;
  variants: Variant[];
  category: typeof categories.$inferSelect | null;
};

/**
 * Full series + all variants + the parent category. Used by series detail
 * pages.
 */
export async function getSeriesDetail(
  seriesId: string,
): Promise<SeriesDetail | null> {
  const seriesRow = (
    await db.select().from(series).where(eq(series.id, seriesId)).limit(1)
  )[0];
  if (!seriesRow) return null;

  const variantRows = await db
    .select()
    .from(variants)
    .where(
      and(eq(variants.seriesId, seriesId), eq(variants.isPublished, true)),
    )
    .orderBy(asc(variants.sortOrder), asc(variants.id));

  const categoryRow = seriesRow.categoryId
    ? (
        await db
          .select()
          .from(categories)
          .where(eq(categories.id, seriesRow.categoryId))
          .limit(1)
      )[0] ?? null
    : null;

  return { series: seriesRow, variants: variantRows, category: categoryRow };
}

// ---------- Homepage helpers ----------------------------------------------

/** Just the ids needed for generateStaticParams of category pages. */
export async function getAllCategoryIds(): Promise<string[]> {
  const rows = await db.select({ id: categories.id }).from(categories);
  return rows.map((r) => r.id);
}

/** All (categoryId, seriesId) tuples for generateStaticParams of series pages. */
export async function getAllSeriesParams(): Promise<
  Array<{ categoryId: string; seriesId: string }>
> {
  const rows = await db
    .select({ categoryId: series.categoryId, seriesId: series.id })
    .from(series)
    .where(eq(series.isPublished, true));
  return rows
    .filter((r): r is { categoryId: string; seriesId: string } =>
      Boolean(r.categoryId),
    )
    .map((r) => ({ categoryId: r.categoryId, seriesId: r.seriesId }));
}

/**
 * Featured products for the homepage preview — one representative variant
 * from each of three different categories that span the product spectrum.
 * Picks deterministically by id so the same trio shows on every build.
 *
 * The shape mirrors `FeaturedVariant` from `ProductPreview.tsx` for a clean
 * server-to-client prop handoff.
 */
export async function getFeaturedVariants(): Promise<
  Array<{
    variantId: string;
    variantName: { zh: string; en: string };
    variantTag: { zh: string; en: string } | null;
    seriesId: string;
    seriesName: { zh: string; en: string };
    seriesComposition: { zh: string; en: string } | null;
    categoryId: string;
    categoryName: { zh: string; en: string };
  }>
> {
  // Curated: one FEVE coating resin, one FKM rubber, one PVDF resin.
  const featuredVariantIds = ["jf-2x", "fe2601-30", "pvdf-t-1"];

  const result: Array<{
    variantId: string;
    variantName: { zh: string; en: string };
    variantTag: { zh: string; en: string } | null;
    seriesId: string;
    seriesName: { zh: string; en: string };
    seriesComposition: { zh: string; en: string } | null;
    categoryId: string;
    categoryName: { zh: string; en: string };
  }> = [];

  for (const id of featuredVariantIds) {
    const v = (
      await db.select().from(variants).where(eq(variants.id, id)).limit(1)
    )[0];
    if (!v) continue;
    const s = (
      await db.select().from(series).where(eq(series.id, v.seriesId)).limit(1)
    )[0];
    if (!s) continue;
    if (!s.categoryId) continue;
    const c = (
      await db
        .select()
        .from(categories)
        .where(eq(categories.id, s.categoryId))
        .limit(1)
    )[0];
    if (!c) continue;

    result.push({
      variantId: v.id,
      variantName: v.nameI18n as { zh: string; en: string },
      variantTag: (v.tagI18n as { zh: string; en: string } | null) ?? null,
      seriesId: s.id,
      seriesName: s.nameI18n as { zh: string; en: string },
      seriesComposition:
        (s.compositionI18n as { zh: string; en: string } | null) ?? null,
      categoryId: s.categoryId,
      categoryName: c.nameI18n as { zh: string; en: string },
    });
  }
  return result;
}

/**
 * Top-N categories for the homepage product-system block, each with a few
 * sample series names so the card shows real product codes instead of
 * placeholder tags.
 *
 * Sort order: by variant count descending (most-stocked categories first),
 * stable tie-break by id.
 */
export async function getHomepageCategories(
  limit = 3,
): Promise<
  Array<{
    id: string;
    name: { zh: string; en: string };
    seriesCount: number;
    variantsCount: number;
    sampleSeries: Array<{ id: string; name: { zh: string; en: string } }>;
  }>
> {
  const cats = await getCategoriesWithCounts();
  const top = [...cats]
    .sort((a, b) => b.variantsCount - a.variantsCount || a.id.localeCompare(b.id))
    .slice(0, limit);

  return Promise.all(
    top.map(async (c) => {
      const seriesRows = await db
        .select({ id: series.id, name: series.nameI18n })
        .from(series)
        .where(and(eq(series.categoryId, c.id), eq(series.isPublished, true)))
        .orderBy(asc(series.sortOrder), asc(series.id))
        .limit(5);

      return {
        id: c.id,
        name: c.name,
        seriesCount: c.seriesCount,
        variantsCount: c.variantsCount,
        sampleSeries: seriesRows.map((s) => ({
          id: s.id,
          name: s.name as { zh: string; en: string },
        })),
      };
    }),
  );
}
