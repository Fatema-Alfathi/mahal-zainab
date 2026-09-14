"use client";

import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";

export function RoleSwitcher() {
  const { isOwner, sessionName, signOut } = useShop();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white ring-1 ring-white/25">
          {isOwner ? t("role.owner") : sessionName || t("role.staff")}
        </span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-2xl px-3 py-1.5 text-sm text-white hover:bg-white/15"
        >
          {t("signOut")}
        </button>
      </div>
      <p className="text-sm font-medium text-[#ffd76a]">{isOwner ? t("role.ownerHint") : t("role.staffHint")}</p>
    </div>
  );
}
