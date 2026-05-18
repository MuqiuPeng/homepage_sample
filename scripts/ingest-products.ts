/**
 * Sync data/products.json → Postgres.
 *
 * Run:  pnpm db:ingest
 *
 * Strategy
 * --------
 * - Categories & series: upsert by `id` (insert or update). Old rows whose
 *   id is no longer in the JSON are deleted at the end.
 * - Variants: full-replace per series (delete all variants of the series,
 *   then re-insert). Variants are owned by their series; this avoids
 *   subtle diff bugs when a series's spec list changes.
 *
 * The JSON file is the source of truth — running this script is safe to
 * repeat. Anything that exists in the DB but not in the JSON gets removed.
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq, inArray, notInArray } from "drizzle-orm";

import { db } from "../lib/db";
import {
  categories,
  series,
  variants,
  type SpecsRecord,
  type SpecsSchemaEntry,
} from "../lib/db/schema";

type JsonProducts = {
  $schema_version?: string;
  categories: Array<{
    id: string;
    name: { zh: string; en: string };
    parent_id?: string | null;
    sort_order?: number;
  }>;
  series: Array<{
    id: string;
    category: string;
    name: { zh: string; en: string };
    manufacturer?: { zh: string; en: string };
    since_year?: number;
    form?: string | null;
    chemistry?: { zh: string; en: string };
    composition?: { zh: string; en: string };
    description?: { zh: string; en: string };
    applications?: { zh: string[]; en: string[] };
    engineering_cases?: Array<{ zh: string; en: string }>;
    packaging?: Array<{ zh: string; en: string }>;
    shipping_note?: { zh: string; en: string };
    data_disclaimer?: { zh: string; en: string };
    specs_schema: SpecsSchemaEntry[];
    hero_image_url?: string;
    msds_url?: string;
    sort_order?: number;
    is_published?: boolean;
    variants: Array<{
      id: string;
      name: { zh: string; en: string };
      tag?: { zh: string; en: string } | null;
      description?: { zh: string; en: string } | null;
      specs: SpecsRecord;
      image_url?: string;
      msds_url?: string;
      cas_number?: string;
      hs_code?: string;
      sort_order?: number;
      is_published?: boolean;
    }>;
  }>;
};

const file = resolve(process.cwd(), "data/products.json");
const data = JSON.parse(readFileSync(file, "utf-8")) as JsonProducts;

const now = new Date();

async function main() {
  console.log(`📥  Ingesting ${file}`);
  console.log(
    `    ${data.categories.length} category, ${data.series.length} series, ${data.series.reduce((n, s) => n + s.variants.length, 0)} variants`,
  );

  await db.transaction(async (tx) => {
    // -------- categories: upsert ----------------------------------------
    for (const c of data.categories) {
      await tx
        .insert(categories)
        .values({
          id: c.id,
          nameI18n: c.name,
          parentId: c.parent_id ?? null,
          sortOrder: c.sort_order ?? 0,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            nameI18n: c.name,
            parentId: c.parent_id ?? null,
            sortOrder: c.sort_order ?? 0,
            updatedAt: now,
          },
        });
    }
    // delete categories that fell out of the JSON
    const keepCategoryIds = data.categories.map((c) => c.id);
    if (keepCategoryIds.length > 0) {
      await tx.delete(categories).where(notInArray(categories.id, keepCategoryIds));
    }

    // -------- series: upsert --------------------------------------------
    for (const s of data.series) {
      const seriesRow = {
        id: s.id,
        categoryId: s.category,
        nameI18n: s.name,
        manufacturerI18n: s.manufacturer ?? null,
        sinceYear: s.since_year ?? null,
        form: s.form ?? null,
        // accept either `composition` (preferred new name) or `chemistry`
        compositionI18n: s.composition ?? s.chemistry ?? null,
        descriptionI18n: s.description ?? null,
        applicationsI18n: s.applications ?? null,
        engineeringCases: s.engineering_cases ?? null,
        packaging: s.packaging ?? null,
        shippingNoteI18n: s.shipping_note ?? null,
        dataDisclaimerI18n: s.data_disclaimer ?? null,
        specsSchema: s.specs_schema,
        heroImageUrl: s.hero_image_url ?? null,
        msdsUrl: s.msds_url ?? null,
        sortOrder: s.sort_order ?? 0,
        isPublished: s.is_published ?? true,
        updatedAt: now,
      };
      await tx
        .insert(series)
        .values(seriesRow)
        .onConflictDoUpdate({ target: series.id, set: seriesRow });

      // -------- variants: full-replace under each series ----------------
      // delete the old set first (cascade: none needed since we own the rows),
      // then bulk-insert the new ones.
      await tx.delete(variants).where(eq(variants.seriesId, s.id));
      if (s.variants.length > 0) {
        await tx.insert(variants).values(
          s.variants.map((v, i) => ({
            id: v.id,
            seriesId: s.id,
            nameI18n: v.name,
            tagI18n: v.tag ?? null,
            descriptionI18n: v.description ?? null,
            specs: v.specs,
            imageUrl: v.image_url ?? null,
            msdsUrl: v.msds_url ?? null,
            casNumber: v.cas_number ?? null,
            hsCode: v.hs_code ?? null,
            sortOrder: v.sort_order ?? i,
            isPublished: v.is_published ?? true,
          })),
        );
      }
    }

    // delete series that fell out of the JSON (cascades to their variants)
    const keepSeriesIds = data.series.map((s) => s.id);
    if (keepSeriesIds.length > 0) {
      await tx.delete(series).where(notInArray(series.id, keepSeriesIds));
    }
  });

  // post-ingest summary
  const [cats, sers, vars] = await Promise.all([
    db.select({ id: categories.id }).from(categories),
    db.select({ id: series.id }).from(series),
    db.select({ id: variants.id }).from(variants),
  ]);
  console.log(
    `✅  Done. DB now has: ${cats.length} categories, ${sers.length} series, ${vars.length} variants.`,
  );
  // postgres-js keeps the process alive otherwise.
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Ingest failed:");
  console.error(err);
  process.exit(1);
});
