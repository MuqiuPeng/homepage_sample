"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/routing";

const labels: Record<Locale, string> = {
  zh: "中",
  en: "EN",
};

export function LocaleToggle({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: target, scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-surface-strong bg-surface-card p-1",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      <Globe className="ml-2 h-4 w-4 text-ink-subtle" aria-hidden />
      {(Object.keys(labels) as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          aria-label={`Switch to ${l === "zh" ? "Chinese" : "English"}`}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all duration-300",
            l === locale
              ? "bg-brand-700 text-ink-onbrand"
              : "text-ink-muted hover:text-ink-strong",
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
