import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Overview } from "@/components/sections/Overview";
import { ProductSystem } from "@/components/sections/ProductSystem";
import { Industries } from "@/components/sections/Industries";
import { WhyUs } from "@/components/sections/WhyUs";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { Contact } from "@/components/sections/Contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustStrip />
      <Overview />
      <ProductSystem />
      <Industries />
      <WhyUs />
      <ProductPreview />
      <Contact />
    </>
  );
}
