import { Hexagon, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
  WechatIcon,
} from "@/components/ui/SocialIcons";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact.info");
  const year = new Date().getFullYear();
  const brand = tNav("brand");
  const email = tContact("email.value");
  const phone = tContact("sales.value");

  return (
    <footer className="relative mt-24 border-t border-surface-strong bg-surface-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-ink-onbrand">
              <Hexagon className="h-5 w-5 stroke-white" strokeWidth={2} />
            </span>
            <span className="text-base font-semibold text-ink-strong">
              {brand}
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
            {t("tagline")}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[
              { icon: GithubIcon, label: "GitHub" },
              { icon: LinkedinIcon, label: "LinkedIn" },
              { icon: XIcon, label: "X" },
              { icon: WechatIcon, label: "WeChat" },
              { icon: Mail, label: "Email" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-md border border-surface-strong text-ink-subtle transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {t("nav")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {["home", "about", "products", "industries", "contact"].map(
              (key) => (
                <li key={key}>
                  <a
                    href={`#${key === "home" ? "hero" : key}`}
                    className="transition-colors hover:text-brand-700"
                  >
                    {tNav(key)}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {t("contact")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>{t("address")}</li>
            <li>
              <a
                href={`mailto:${email}`}
                className="transition-colors hover:text-brand-700"
              >
                {email}
              </a>
            </li>
            <li>{phone}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-subtle sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} {brand}. {t("rights")}</p>
          <p>{t("legal")}</p>
        </div>
      </div>
    </footer>
  );
}
