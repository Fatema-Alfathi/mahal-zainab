"use client";

import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";

export function RoleSwitcher() {
  const { isOwner, sessionName, signOut } = useShop();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
          {isOwner ? t("role.owner") : sessionName || t("role.staff")}
        </span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-1.5 text-sm font-medium text-[var(--salla-primary)] transition hover:bg-[var(--salla-soft)]"
        >
          {t("signOut")}
        </button>
      </div>
      <p className="text-xs font-medium text-[var(--salla-muted)]">
        {isOwner ? t("role.ownerHint") : t("role.staffHint")}
      </p>
    </div>
  );
}
