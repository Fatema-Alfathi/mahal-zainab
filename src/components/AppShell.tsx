"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Menu,
  Moon,
  Shirt,
  Sun,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";

export type ShellPage = "home" | "dresses" | "customers" | "calendar";

const NAV: Array<{ id: ShellPage; href: string; labelKey: string; icon: typeof LayoutDashboard }> = [
  { id: "home", href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { id: "customers", href: "/customers", labelKey: "nav.customers", icon: Users },
  { id: "calendar", href: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { id: "dresses", href: "/dresses", labelKey: "nav.dresses", icon: Shirt },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] text-[var(--salla-primary)] transition hover:bg-[var(--salla-soft)]"
      aria-label={dark ? "التبديل للوضع النهاري" : "التبديل للوضع الليلي"}
      title={dark ? "وضع نهاري" : "وضع ليلي"}
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

function NavLinks({
  active,
  onNavigate,
  variant,
}: {
  active: ShellPage;
  onNavigate?: () => void;
  variant: "sidebar" | "top";
}) {
  const { t } = useLanguage();
  const { isOwner } = useShop();

  return (
    <nav
      className={cn(
        variant === "sidebar" ? "flex flex-col gap-1.5 px-3" : "flex flex-wrap items-center gap-1.5",
      )}
      aria-label={t("nav.pages")}
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        const on = active === item.id;
        const label =
          item.id === "home" ? (isOwner ? t("nav.dashboard") : t("nav.floor")) : t(item.labelKey);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border text-sm font-semibold transition",
              variant === "sidebar" ? "w-full px-3 py-2.5" : "px-3 py-2",
              on
                ? "border-[var(--salla-primary)] bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#200000]"
                : "border-[var(--salla-border)] bg-[var(--salla-surface)] text-[#2a0c12] hover:border-[var(--salla-primary)] hover:text-[var(--salla-primary)] dark:bg-[var(--salla-soft)] dark:text-[#f5ebe0]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  active = "home",
  children,
}: {
  active?: ShellPage;
  children: React.ReactNode;
}) {
  const { isOwner } = useShop();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const title =
    active === "home"
      ? isOwner
        ? t("nav.dashboard")
        : t("nav.floor")
      : t(
          active === "customers"
            ? "nav.customers"
            : active === "calendar"
              ? "nav.calendar"
              : "nav.dresses",
        );

  return (
    <div className="flex min-h-full bg-[var(--salla-bg)] text-[var(--foreground)]">
      <aside className="shell-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col py-5 lg:flex lg:flex-col">
        <div className="mb-6 flex items-center gap-3 px-5">
          <BrandLogo />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--salla-primary)]">{t("brand")}</p>
            <p className="truncate text-xs text-[var(--salla-muted)]">{t("tagline")}</p>
          </div>
        </div>
        <NavLinks active={active} variant="sidebar" />
        <div className="mt-auto px-5 pt-6">
          <p className="text-xs leading-5 text-[var(--salla-muted)]">
            {isOwner ? t("role.ownerHint") : t("role.staffHint")}
          </p>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />
          <aside className="shell-sidebar absolute inset-y-0 start-0 flex w-72 flex-col py-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <BrandLogo />
                <p className="font-semibold text-[var(--salla-primary)]">{t("brand")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks active={active} variant="sidebar" onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shop-header sticky top-0 z-30">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] text-[var(--foreground)] hover:bg-[var(--salla-soft)] lg:hidden"
                  onClick={() => setOpen(true)}
                  aria-label={t("nav.pages")}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0 lg:hidden">
                  <h1 className="truncate text-base font-semibold text-[var(--foreground)]">{title}</h1>
                </div>
                <p className="hidden text-sm font-semibold text-[var(--foreground)] lg:block">{title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
                <RoleSwitcher />
              </div>
            </div>

            <div className="border-t border-[var(--salla-border)] pt-3">
              <NavLinks active={active} variant="top" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
