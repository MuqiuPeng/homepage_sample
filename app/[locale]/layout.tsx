import type { Metadata, Viewport } from "next";
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
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/ThemeScript";
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

// Lock the viewport to device width with no user scaling — the design relies
// on the desktop-vs-mobile breakpoint hierarchy and pinch-to-zoom would break
// the section "one-page-per-screen" feel on mobile.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-bg via-brand-50/45 to-bg-soft text-ink-strong selection:bg-accent-300/60">
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
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SnapScrollController />
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
