import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Overview } from "@/components/sections/Overview";
import { ProductSystem } from "@/components/sections/ProductSystem";
import { Industries } from "@/components/sections/Industries";
import { WhyUs } from "@/components/sections/WhyUs";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { Contact } from "@/components/sections/Contact";
import {
  getFeaturedVariants,
  getHomepageCategories,
} from "@/lib/db/queries";

// Event-driven ISR: catalog pages are invalidated on demand by
// `/api/revalidate` (called from a Supabase webhook on every DB write), so
// edits show up right away. The long `revalidate` is only a safety-net fallback
// in case a webhook is ever missed — not the primary update path.
export const revalidate = 86400; // 1 day fallback; real updates are push-based

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Server-side data fetch — runs at build time and on each revalidation,
  // then hands plain JSON to the client components below.
  const [categories, featured] = await Promise.all([
    getHomepageCategories(3),
    getFeaturedVariants(),
  ]);

  return (
    <div data-snap-root>
      <Hero />
      <Overview />
      <ProductSystem categories={categories} />
      <Industries />
      <WhyUs />
      <ProductPreview variants={featured} />
      <Contact />
    </div>
  );
}
