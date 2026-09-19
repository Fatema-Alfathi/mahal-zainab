"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";

export function LanguageToggle({ tone = "header" }: { tone?: "header" | "card" }) {
  const { locale, setLocale, t } = useLanguage();
  const header = tone === "header";

  return (
    <div
      className={cn(
        "inline-flex rounded-xl p-1 text-xs font-medium",
        header
          ? "border border-[var(--salla-border)] bg-[var(--salla-surface)]"
          : "border border-[var(--salla-border)] bg-[var(--salla-soft)]",
      )}
      role="group"
      aria-label={t("lang.aria")}
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-lg px-3 py-1.5 transition",
          locale === "ar"
            ? "bg-[var(--salla-primary)] text-white dark:text-[#200000]"
            : "text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
        )}
      >
        {t("arabic")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-lg px-3 py-1.5 transition",
          locale === "en"
            ? "bg-[var(--salla-primary)] text-white dark:text-[#200000]"
            : "text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
        )}
      >
        {t("english")}
      </button>
    </div>
  );
}
