import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import {
  Beaker,
  Layers,
  Atom,
  FlaskConical,
  Box,
  Droplets,
  TestTube,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategoriesWithCounts } from "@/lib/db/queries";
import { pickI18n, type Locale } from "@/lib/i18n-helpers";

// Statically pre-render at build time; revalidate on demand by re-deploying.
export const dynamic = "force-static";

/**
 * Visual icon + accent palette per category. Kept local because it's pure
 * presentation — the catalog data itself doesn't know what icon to show.
 */
const CATEGORY_VISUAL: Record<
  string,
  { icon: typeof Atom; accent: string }
> = {
  fluororesin:               { icon: Beaker,       accent: "from-brand-600 to-brand-800" },
  fluoroelastomer:           { icon: Atom,         accent: "from-brand-500 to-accent-400" },
  pvdf:                      { icon: Layers,       accent: "from-accent-400 to-accent-600" },
  ptfe:                      { icon: FlaskConical, accent: "from-brand-700 to-brand-900" },
  fep:                       { icon: Box,          accent: "from-brand-400 to-brand-600" },
  pfa:                       { icon: Droplets,     accent: "from-accent-300 to-accent-500" },
  "fluorine-fine-chemicals": { icon: TestTube,     accent: "from-brand-500 to-accent-500" },
};

export default async function ProductsLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations("products");

  const categories = await getCategoriesWithCounts();

  return (
    <section className="relative px-4 pt-32 pb-24 sm:px-6 sm:pt-36 sm:pb-32 lg:px-8 lg:pb-40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={tr("eyebrow")}
          title={tr("title")}
          description={tr("subtitle")}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const visual = CATEGORY_VISUAL[c.id] ?? {
              icon: Atom,
              accent: "from-brand-600 to-brand-800",
            };
            const Icon = visual.icon;
            return (
              <Link
                key={c.id}
                href={`/products/${c.id}`}
                className="group block"
              >
                <GlassCard className="h-full !p-7 sm:!p-8">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${visual.accent} text-ink-onbrand shadow-brand-md`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-ink-strong">
                    {pickI18n(c.name, locale as Locale)}
                  </h3>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-ink-subtle">
                        {tr("seriesCount")}
                      </dt>
                      <dd className="mt-0.5 text-2xl font-semibold text-brand-700">
                        {c.seriesCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-ink-subtle">
                        {tr("variantsCount")}
                      </dt>
                      <dd className="mt-0.5 text-2xl font-semibold text-brand-700">
                        {c.variantsCount}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 group-hover:gap-2.5 transition-all duration-300">
                    {tr("viewCategory")}
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [tr, tn] = await Promise.all([
    getTranslations({ locale, namespace: "products" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  return {
    title: `${tr("title")} — ${tn("brand")}`,
    description: tr("subtitle"),
  };
}
