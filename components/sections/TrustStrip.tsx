import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck, BadgeCheck, Heart, Anchor } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

const ITEMS = [
  { key: "iso", icon: ShieldCheck },
  { key: "reach", icon: BadgeCheck },
  { key: "care", icon: Heart },
  { key: "ports", icon: Anchor },
] as const;

// The "logos" band underneath the trust items shows downstream industry
// segments our materials serve rather than a literal customer-logo strip —
// we don't have permission to display partner brand marks. Worded compactly
// because they scroll in a marquee.
const SEGMENTS = {
  zh: ["新能源 / 锂电", "光伏背板", "半导体", "高频通信", "化工与油气", "医药与农药", "建筑与桥梁", "航空航天"],
  en: ["New energy / Li-ion", "PV backsheet", "Semiconductor", "High-frequency comms", "Chemicals & oil/gas", "Pharma & agro", "Construction & bridges", "Aerospace"],
} as const;

export function TrustStrip() {
  const t = useTranslations("trustStrip");
  const locale = useLocale();
  const segments = locale === "en" ? SEGMENTS.en : SEGMENTS.zh;

  // Rendered inside the Hero section as the bottom band — no top-level
  // <section> wrapper / snap point of its own.
  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      <RevealOnScroll>
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/65 bg-surface-glass px-6 py-5 backdrop-blur-xl shadow-glass sm:px-10 sm:py-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            {t("tagline")}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {ITEMS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50/70 to-surface-strong/60 px-4 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-ink-onbrand shadow-brand-md">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium leading-snug text-ink-strong">
                  {t(`items.${key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col items-center gap-3 border-t border-brand-100/60 pt-6 sm:flex-row sm:gap-6">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
              {t("logosLabel")}
            </span>
            <div className="w-full min-w-0 flex-1">
              <Marquee speed={42}>
                {segments.map((name) => (
                  <span
                    key={name}
                    className="text-base font-semibold tracking-wide text-ink-faint"
                  >
                    {name}
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
