import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Users, Workflow, Globe2 } from "lucide-react";

const BLOCKS = [
  { key: "who", icon: Users },
  { key: "what", icon: Workflow },
  { key: "where", icon: Globe2 },
] as const;

const METRICS = [
  { key: "experience", to: 26, hasSuffix: true },
  { key: "suppliers", to: 200, hasSuffix: true },
  { key: "markets", to: 60, hasSuffix: true },
  { key: "warehouses", to: 8, hasSuffix: true },
] as const;

export function Overview() {
  const t = useTranslations("overview");

  return (
    <section
      id="about"
      className="relative snap-start min-h-svh flex flex-col lg:justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map(({ key, icon: Icon }, i) => (
            <RevealOnScroll key={key} delay={i * 0.08}>
              <GlassCard className="h-full" glow>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_8px_20px_rgba(15,76,92,0.35)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {t(`blocks.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {t(`blocks.${key}.description`)}
                </p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2} className="mt-14">
          <GlassCard className="!p-8 sm:!p-10">
            <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {METRICS.map((m) => (
                <div key={m.key} className="text-center sm:text-left">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t(`metrics.${m.key}.label`)}
                  </dt>
                  <dd className="mt-3 flex items-baseline justify-center gap-1 sm:justify-start">
                    <AnimatedCounter
                      to={m.to}
                      className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
                    />
                    {m.hasSuffix && (
                      <span className="text-2xl font-semibold text-brand-600 sm:text-3xl">
                        {t(`metrics.${m.key}.suffix`)}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        </RevealOnScroll>
      </div>
    </section>
  );
}
