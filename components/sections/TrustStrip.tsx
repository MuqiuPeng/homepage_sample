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

  return (
    <section className="relative px-4 sm:px-6 lg:px-8">
      <RevealOnScroll>
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/65 bg-white/55 px-6 py-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,76,92,0.08)] sm:px-10 sm:py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            {t("tagline")}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {ITEMS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50/70 to-white/60 px-4 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_4px_12px_rgba(15,76,92,0.35)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium leading-snug text-slate-800">
                  {t(`items.${key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col items-center gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:gap-6">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("logosLabel")}
            </span>
            <div className="w-full min-w-0 flex-1">
              <Marquee speed={42}>
                {PARTNERS.map((name) => (
                  <span
                    key={name}
                    className="text-base font-semibold tracking-wide text-slate-400"
                  >
                    {name}
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
