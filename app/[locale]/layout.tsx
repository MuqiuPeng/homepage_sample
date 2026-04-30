import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GradientBlob } from "@/components/ui/GradientBlob";
import { GridBackground } from "@/components/ui/GridBackground";
import { SnapScrollController } from "@/components/motion/SnapScrollController";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSC.variable} h-full antialiased`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fbfaf6] via-brand-50/45 to-[#f4f1ea] text-slate-900 selection:bg-accent-300/60">
        <GridBackground />
        <GradientBlob className="left-[-10%] top-[-10%] h-[480px] w-[480px] bg-brand-300/40" />
        <GradientBlob
          className="right-[-15%] top-[20%] h-[520px] w-[520px] bg-accent-300/35"
          delay="6s"
        />
        <GradientBlob
          className="left-[30%] top-[55%] h-[600px] w-[600px] bg-brand-200/45"
          delay="12s"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SnapScrollController />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
