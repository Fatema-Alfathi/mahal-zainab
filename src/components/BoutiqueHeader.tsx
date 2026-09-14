"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";

export function BoutiqueHeader({ active = "home" }: { active?: "home" | "dresses" | "customers" | "calendar" }) {
  const { isOwner } = useShop();
  const { t } = useLanguage();
  const onHome = active === "home";
  const onDresses = active === "dresses";
  const onCustomers = active === "customers";
  const onCalendar = active === "calendar";

  return (
    <header className="shop-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div>
            <p className="font-serif text-2xl text-white">{t("brand")}</p>
            <p className="text-sm font-medium text-[#ffd76a]">{t("tagline")}</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label={t("nav.pages")}>
          <Link
            href="/"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onHome ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            {isOwner ? t("nav.dashboard") : t("nav.floor")}
          </Link>
          <Link
            href="/customers"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onCustomers ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            {t("nav.customers")}
          </Link>
          <Link
            href="/calendar"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onCalendar ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            {t("nav.calendar")}
          </Link>
          <Link
            href="/dresses"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onDresses ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            {t("nav.dresses")}
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <LanguageToggle />
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
