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

// ISR: pre-render statically, then re-generate in the background at most
// once every 60s so database edits show up without a redeploy.
export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Server-side data fetch — runs once at build time, plain JSON over to
  // the client components below.
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
