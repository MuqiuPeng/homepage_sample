import { cn } from "@/lib/cn";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"button">;

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 to-accent-500 text-ink-onbrand shadow-brand-md hover:shadow-brand-lg hover:from-brand-700 hover:to-accent-600",
  ghost:
    "bg-surface-glass text-ink-strong border border-surface-strong/70 backdrop-blur-md hover:bg-surface-card hover:border-brand-200",
  outline:
    "bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50/80 hover:border-brand-500",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className,
  children,
  href,
  ...rest
}: { href: string; variant?: Variant; className?: string; children: ReactNode } & ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
