/**
 * Helpers for picking the right language from a `{ zh, en }` JSONB field at
 * runtime. The DB stores both languages on every translatable field; the
 * current `locale` (from `next-intl`) decides which to render.
 */

import type { I18n, I18nList } from "@/lib/db/schema";

export type Locale = "zh" | "en";

/** Pick the localized string from a bilingual `{ zh, en }` object. Falls back
 *  to the other language if the requested one is empty. Returns `null` if
 *  both sides are missing. */
export function pickI18n(
  field: I18n | null | undefined,
  locale: Locale,
): string | null {
  if (!field) return null;
  const primary = field[locale];
  if (primary) return primary;
  const fallback = locale === "zh" ? field.en : field.zh;
  return fallback ?? null;
}

/** Pick the localized string[] from a bilingual `{ zh: string[], en: string[] }`. */
export function pickI18nList(
  field: I18nList | null | undefined,
  locale: Locale,
): string[] {
  if (!field) return [];
  const primary = field[locale];
  if (primary && primary.length > 0) return primary;
  const fallback = locale === "zh" ? field.en : field.zh;
  return fallback ?? [];
}

/**
 * Render a spec value into a display string. Spec values can be:
 *   - a plain string ("≥50", "100~200", "65±2")
 *   - a bilingual `{ zh, en }` (e.g. "无色透明液体" / "Colorless transparent liquid")
 *   - a bilingual list `{ zh: string[], en: string[] }` (solvents)
 *   - null (not applicable)
 */
export function renderSpecValue(
  value: unknown,
  locale: Locale,
): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // bilingual list
    if (Array.isArray(obj.zh) || Array.isArray(obj.en)) {
      const list = pickI18nList(obj as I18nList, locale);
      return list.join(" / ");
    }
    // bilingual string
    if (typeof obj.zh === "string" || typeof obj.en === "string") {
      return pickI18n(obj as I18n, locale);
    }
  }
  return String(value);
}
