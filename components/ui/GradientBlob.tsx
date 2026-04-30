import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  delay?: string;
};

export function GradientBlob({ className, delay = "0s" }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full blur-3xl mix-blend-multiply opacity-70",
        "animate-[blob_18s_ease-in-out_infinite]",
        className,
      )}
      style={{ animationDelay: delay }}
    />
  );
}
