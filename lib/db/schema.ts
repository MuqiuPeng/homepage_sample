/**
 * Drizzle schema for the bilingual product catalog.
 *
 * Design rules:
 * - All translatable / heterogeneous text uses JSONB. Bilingual fields
 *   take the shape `{ zh: string; en: string }`.
 * - Strong-typed identity (`id`, FKs) — JSONB is only for content.
 * - `specs` on a variant is heterogeneous: each series defines its own
 *   `specs_schema`, and a variant's specs are a key→value map keyed by
 *   the schema's `key`. Values can be a plain string ("≥50", "100~200")
 *   or a bilingual object (e.g. for "appearance" / "solvent" lists).
 * - `created_at` / `updated_at` track audit; `is_published` gates visibility.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Common JSONB shapes — exported for use in typed code consuming the DB.
export type I18n = { zh: string; en: string };
export type I18nList = { zh: string[]; en: string[] };
export type EngineeringCase = { zh: string; en: string };
export type PackageItem = { zh: string; en: string };
export type SpecsSchemaEntry = {
  key: string;
  label: I18n;
  unit: string | null;
  // Optional test method / standard reference (e.g. "GB/T 1232.1 ML(1+10)@121°C",
  // "F¹⁹ NMR"). Common on rubber/elastomer data sheets; absent on most resin
  // sheets. Stored bilingually for catalogs targeting CN+EN markets.
  test_method?: I18n | null;
};
export type SpecValue = string | I18n | I18nList | null;
export type SpecsRecord = Record<string, SpecValue>;

// ============================================================================
// categories — top-level taxonomy ('fluororesin', 'polymer', 'coating', ...).
// ============================================================================
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  nameI18n: jsonb("name_i18n").$type<I18n>().notNull(),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// series — a product line (e.g. JF series). Owns shared metadata.
// ============================================================================
export const series = pgTable(
  "series",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    nameI18n: jsonb("name_i18n").$type<I18n>().notNull(),
    manufacturerI18n: jsonb("manufacturer_i18n").$type<I18n>(),
    sinceYear: integer("since_year"),
    // Physical form slug. Examples seen so far:
    //   - 'raw_rubber'  生胶 (most fluoroelastomers)
    //   - 'dispersion'  分散液 (FE2600D)
    //   - 'powder'      粉末 (FE2651)
    //   - 'solution'    溶剂型液体 (fluororesins, if backfilled)
    // Left as a plain text slug so new forms can be added without a migration;
    // UI labels are translated via the i18n message catalog.
    form: text("form"),
    compositionI18n: jsonb("composition_i18n").$type<I18n>(),
    descriptionI18n: jsonb("description_i18n").$type<I18n>(),
    applicationsI18n: jsonb("applications_i18n").$type<I18nList>(),
    engineeringCases: jsonb("engineering_cases").$type<EngineeringCase[]>(),
    packaging: jsonb("packaging").$type<PackageItem[]>(),
    shippingNoteI18n: jsonb("shipping_note_i18n").$type<I18n>(),
    dataDisclaimerI18n: jsonb("data_disclaimer_i18n").$type<I18n>(),
    specsSchema: jsonb("specs_schema").$type<SpecsSchemaEntry[]>().notNull(),
    heroImageUrl: text("hero_image_url"),
    msdsUrl: text("msds_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("series_category_idx").on(t.categoryId)],
);

// ============================================================================
// variants — concrete SKU under a series (e.g. JF-2X, JF-3X).
// `specs` is keyed by the parent series' specs_schema entries.
// ============================================================================
export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    nameI18n: jsonb("name_i18n").$type<I18n>().notNull(),
    tagI18n: jsonb("tag_i18n").$type<I18n>(),
    descriptionI18n: jsonb("description_i18n").$type<I18n>(),
    specs: jsonb("specs").$type<SpecsRecord>().notNull(),
    imageUrl: text("image_url"),
    msdsUrl: text("msds_url"),
    casNumber: text("cas_number"),
    hsCode: text("hs_code"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("variants_series_idx").on(t.seriesId),
    // GIN index lets `WHERE specs ? 'fluorine_content'` and
    // `WHERE specs->>'fluorine_content' = '25±1'` use an index instead of
    // sequential scans. Critical once the catalog grows.
    index("variants_specs_gin_idx").using("gin", t.specs),
  ],
);

// Inferred row + insert types — convenient when typing service-layer code.
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;
