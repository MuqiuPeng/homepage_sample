"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { THEMES, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

export function ThemeSwitcher({ className }: Props) {
  const t = useTranslations("themeSwitcher");
  const { theme, mode, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Esc
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleThemeClick(id: ThemeId) {
    setTheme(id);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("buttonLabel")}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="grid h-9 w-9 place-items-center rounded-full border border-surface-strong/70 bg-surface-glass text-ink-muted backdrop-blur-md transition-colors hover:text-brand-700"
      >
        <Palette className="h-4 w-4" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={t("title")}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-surface-strong/70 bg-surface-card p-2 shadow-glass-lg backdrop-blur-xl"
          >
            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
              {t("title")}
            </div>
            <ul role="radiogroup" aria-label={t("title")} className="space-y-0.5">
              {THEMES.map((th) => {
                const active = th.id === theme;
                return (
                  <li key={th.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleThemeClick(th.id)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-brand-50/70 text-ink-strong"
                          : "text-ink-muted hover:bg-brand-50/40 hover:text-ink-strong",
                      )}
                    >
                      <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full">
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${th.brand} 0%, ${th.brand} 50%, ${th.accent} 50%, ${th.accent} 100%)`,
                          }}
                        />
                        <span className="relative h-3 w-3 rounded-full bg-surface-strong/70" />
                      </span>
                      <span className="flex-1 truncate font-medium">
                        {t(th.labelKey)}
                      </span>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.2} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-2 border-t border-ink-faint/20 px-1 pt-2 pb-1">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
                {t("modeLabel")}
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                {(["light", "dark"] as const).map((m) => {
                  const active = m === mode;
                  const Icon = m === "light" ? Sun : Moon;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-gradient-to-br from-brand-600 to-brand-800 text-ink-onbrand"
                          : "text-ink-muted hover:bg-brand-50/40 hover:text-ink-strong",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      {t(m === "light" ? "modeLight" : "modeDark")}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
