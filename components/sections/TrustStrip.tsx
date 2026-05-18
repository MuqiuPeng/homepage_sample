import { useTranslations } from "next-intl";
import { ShieldCheck, BadgeCheck, Heart, Anchor } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

const ITEMS = [
  { key: "iso", icon: ShieldCheck },
  { key: "reach", icon: BadgeCheck },
  { key: "care", icon: Heart },
  { key: "ports", icon: Anchor },
] as const;

const PARTNERS = [
  "[ Logo 01 ]",
  "[ Logo 02 ]",
  "[ Logo 03 ]",
  "[ Logo 04 ]",
  "[ Logo 05 ]",
  "[ Logo 06 ]",
  "[ Logo 07 ]",
  "[ Logo 08 ]",
];

export function TrustStrip() {
  const t = useTranslations("trustStrip");

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
                {PARTNERS.map((name) => (
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
