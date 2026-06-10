"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Headphones,
  CheckCircle2,
  Send,
  AlertCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Form = {
  name: string;
  company: string;
  email: string;
  product: string;
  quantity: string;
  message: string;
};
type Errors = Partial<Record<keyof Form, string>>;

const INFO = [
  { icon: MapPin, key: "address" },
  { icon: Mail, key: "email" },
  { icon: Phone, key: "sales" },
  { icon: Headphones, key: "support" },
] as const;

export function Contact() {
  const t = useTranslations("contact");
  const [form, setForm] = useState<Form>({
    name: "",
    company: "",
    email: "",
    product: "",
    quantity: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function validate(values: Form): Errors {
    const e: Errors = {};
    if (!values.name.trim()) e.name = t("errors.required");
    if (!values.email.trim()) {
      e.email = t("errors.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = t("errors.email");
    }
    if (!values.product.trim()) e.product = t("errors.required");
    return e;
  }

  function handleChange(field: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    startTransition(() => {
      console.log("[contact] payload:", form);
      setTimeout(() => {
        setSubmitted(true);
        setForm({
          name: "",
          company: "",
          email: "",
          product: "",
          quantity: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 4500);
      }, 600);
    });
  }

  return (
    <section
      id="contact"
      className="relative snap-start min-h-svh flex flex-col lg:justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassCard className="!p-7 sm:!p-8">
            <h3 className="text-lg font-semibold text-ink-strong">
              {t("infoTitle")}
            </h3>
            <ul className="mt-6 space-y-5">
              {INFO.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-ink-onbrand">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                      {t(`info.${key}.label`)}
                    </p>
                    <p className="mt-1 text-sm text-ink-strong">
                      {t(`info.${key}.value`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-[88px_1fr] gap-4 rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50/60 to-accent-200/40 p-4">
              <div className="aspect-square rounded-xl bg-surface-strong p-2">
                <QrPlaceholder />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-ink-strong">
                  {t("wechat.title")}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {t("wechat.description")}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="!p-7 sm:!p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("form.name")}
                  required
                  error={errors.name}
                  htmlFor="name"
                >
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    autoComplete="name"
                    className={inputCls(!!errors.name)}
                  />
                </FormField>
                <FormField
                  label={t("form.company")}
                  htmlFor="company"
                >
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange("company")}
                    autoComplete="organization"
                    className={inputCls(false)}
                  />
                </FormField>
              </div>

              <FormField
                label={t("form.email")}
                required
                error={errors.email}
                htmlFor="email"
              >
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  className={inputCls(!!errors.email)}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("form.product")}
                  required
                  error={errors.product}
                  htmlFor="product"
                >
                  <input
                    id="product"
                    type="text"
                    value={form.product}
                    onChange={handleChange("product")}
                    className={inputCls(!!errors.product)}
                  />
                </FormField>
                <FormField label={t("form.quantity")} htmlFor="quantity">
                  <input
                    id="quantity"
                    type="text"
                    inputMode="numeric"
                    value={form.quantity}
                    onChange={handleChange("quantity")}
                    className={inputCls(false)}
                  />
                </FormField>
              </div>

              <FormField
                label={t("form.message")}
                error={errors.message}
                htmlFor="message"
              >
                <textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange("message")}
                  className={cn(inputCls(!!errors.message), "resize-y min-h-[120px]")}
                />
              </FormField>

              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-xs text-ink-subtle">{t("form.privacy")}</p>
                <Button type="submit" disabled={pending} className="px-7 py-3">
                  {pending ? t("form.sending") : t("form.submit")}
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-md border border-surface-strong bg-surface-card px-5 py-3 shadow-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-ink-strong">
                {t("form.success")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FormField({
  label,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink-strong"
      >
        {label}
        {required && <span className="ml-1 text-brand-600">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(invalid: boolean) {
  return cn(
    "w-full rounded-xl border bg-surface-card px-4 py-2.5 text-sm text-ink-strong placeholder:text-ink-faint transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-strong/60",
    invalid
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200"
      : "border-surface-strong/70 focus:border-brand-300 focus:ring-brand-200",
  );
}

function QrPlaceholder() {
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
      <rect x="0" y="0" width="60" height="60" style={{ fill: "var(--color-surface-strong)" }} />
      {Array.from({ length: 64 }).map((_, i) => {
        const x = (i % 8) * 7 + 2;
        const y = Math.floor(i / 8) * 7 + 2;
        const filled = (i * 13 + 7) % 5 < 2;
        return filled ? (
          <rect
            key={i}
            x={x}
            y={y}
            width="5"
            height="5"
            style={{ fill: "var(--color-brand-600)" }}
            rx="0.5"
          />
        ) : null;
      })}
      <rect x="2" y="2" width="14" height="14" fill="none" style={{ stroke: "var(--color-brand-600)" }} strokeWidth="2" rx="2" />
      <rect x="44" y="2" width="14" height="14" fill="none" style={{ stroke: "var(--color-brand-600)" }} strokeWidth="2" rx="2" />
      <rect x="2" y="44" width="14" height="14" fill="none" style={{ stroke: "var(--color-brand-600)" }} strokeWidth="2" rx="2" />
      <rect x="6" y="6" width="6" height="6" style={{ fill: "var(--color-brand-600)" }} rx="1" />
      <rect x="48" y="6" width="6" height="6" style={{ fill: "var(--color-brand-600)" }} rx="1" />
      <rect x="6" y="48" width="6" height="6" style={{ fill: "var(--color-brand-600)" }} rx="1" />
    </svg>
  );
}
