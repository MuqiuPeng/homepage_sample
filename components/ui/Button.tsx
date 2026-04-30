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
    "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.5)] hover:from-brand-700 hover:to-accent-600",
  ghost:
    "bg-white/60 text-slate-900 border border-white/70 backdrop-blur-md hover:bg-white/80 hover:border-brand-200",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
