"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";

export function LanguageToggle({ tone = "header" }: { tone?: "header" | "card" }) {
  const { locale, setLocale, t } = useLanguage();
  const header = tone === "header";

  return (
    <div
      className={cn(
        "inline-flex rounded-2xl p-1 text-xs font-medium",
        header ? "bg-white/10 ring-1 ring-white/25" : "bg-rose-50 ring-1 ring-rose-200",
      )}
      role="group"
      aria-label={t("lang.aria")}
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-xl px-3 py-1.5",
          locale === "ar"
            ? header
              ? "shop-btn-gold"
              : "shop-btn"
            : header
              ? "text-white hover:bg-white/10"
              : "text-rose-700 hover:bg-rose-100",
        )}
      >
        {t("arabic")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-xl px-3 py-1.5",
          locale === "en"
            ? header
              ? "shop-btn-gold"
              : "shop-btn"
            : header
              ? "text-white hover:bg-white/10"
              : "text-rose-700 hover:bg-rose-100",
        )}
      >
        {t("english")}
      </button>
    </div>
  );
}
