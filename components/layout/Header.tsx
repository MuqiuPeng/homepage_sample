"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Hexagon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleToggle } from "./LocaleToggle";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * - "page" items use the locale-aware <Link> from next-intl — work on every page.
 * - "anchor" items keep the same-page hash anchor — SnapScrollController
 *   intercepts these for damped smooth scroll on the homepage; they're no-ops
 *   on other pages (acceptable since the brand logo / Products link bring
 *   you back).
 */
const NAV_ITEMS = [
  { href: "#hero",       key: "home",       type: "anchor" },
  { href: "#about",      key: "about",      type: "anchor" },
  { href: "/products",   key: "products",   type: "page"   },
  { href: "#industries", key: "industries", type: "anchor" },
  { href: "#contact",    key: "contact",    type: "anchor" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  const navItemClasses =
    "group relative rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-700";
  const navItemUnderline =
    "pointer-events-none absolute inset-x-3 -bottom-px h-px scale-x-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-x-100";

  const mobileItemClasses =
    "rounded-lg px-3 py-3 text-base font-medium text-ink-strong transition-colors hover:bg-brand-50 hover:text-brand-700";

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/40 bg-surface-glass backdrop-blur-xl shadow-glass"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Brand placeholder"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-ink-onbrand shadow-brand-md transition-transform duration-300 group-hover:scale-105">
            <Hexagon className="h-5 w-5 fill-accent-400/80 stroke-white" strokeWidth={2} />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 to-transparent opacity-60" />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink-faint">
            [ Brand ]
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            item.type === "page" ? (
              <Link key={item.key} href={item.href} className={navItemClasses}>
                {t(item.key)}
                <span className={navItemUnderline} />
              </Link>
            ) : (
              <a key={item.key} href={item.href} className={navItemClasses}>
                {t(item.key)}
                <span className={navItemUnderline} />
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher className="hidden sm:block" />
          <LocaleToggle className="hidden sm:inline-flex" />
          <LinkButton
            href="#contact"
            variant="primary"
            className="hidden px-5 py-2.5 lg:inline-flex"
          >
            {t("cta")}
          </LinkButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-surface-glass text-ink-strong backdrop-blur-md md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-white/50 bg-surface-card backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) =>
              item.type === "page" ? (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={mobileItemClasses}
                >
                  {t(item.key)}
                </Link>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={mobileItemClasses}
                >
                  {t(item.key)}
                </a>
              ),
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LocaleToggle />
                <ThemeSwitcher />
              </div>
              <LinkButton href="#contact" variant="primary" className="px-5 py-2.5">
                {t("cta")}
              </LinkButton>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
