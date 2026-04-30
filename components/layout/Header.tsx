"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Hexagon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleToggle } from "./LocaleToggle";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "#hero", key: "home" },
  { href: "#about", key: "about" },
  { href: "#products", key: "products" },
  { href: "#industries", key: "industries" },
  { href: "#contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/40 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(31,38,135,0.08)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-8">
        <a
          href="#hero"
          className="group flex items-center gap-2.5"
          aria-label="Brand placeholder"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_4px_16px_rgba(15,76,92,0.45)] transition-transform duration-300 group-hover:scale-105">
            <Hexagon className="h-5 w-5 fill-accent-400/80 stroke-white" strokeWidth={2} />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 to-transparent opacity-60" />
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-400">
            [ Brand ]
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="group relative rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
            >
              {t(item.key)}
              <span className="pointer-events-none absolute inset-x-3 -bottom-px h-px scale-x-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
            className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/60 text-slate-700 backdrop-blur-md md:hidden"
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
          className="border-t border-white/50 bg-white/85 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t(item.key)}
              </a>
            ))}
            <div className="mt-3 flex items-center justify-between">
              <LocaleToggle />
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
