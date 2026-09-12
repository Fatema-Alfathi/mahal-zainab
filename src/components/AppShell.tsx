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
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useShop } from "@/context/ShopContext";
import { cn } from "@/lib/format";

export type ShellPage = "home" | "dresses" | "customers" | "calendar";

const NAV: Array<{ id: ShellPage; href: string; label: string; icon: typeof LayoutDashboard }> = [
  { id: "home", href: "/", label: "لوحة المحل", icon: LayoutDashboard },
  { id: "customers", href: "/customers", label: "العميلات", icon: Users },
  { id: "calendar", href: "/calendar", label: "التقويم", icon: CalendarDays },
  { id: "dresses", href: "/dresses", label: "إدارة الفساتين", icon: Shirt },
];

const TITLES: Record<ShellPage, string> = {
  home: "لوحة المحل",
  customers: "العميلات",
  calendar: "التقويم",
  dresses: "إدارة الفساتين",
};

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
  return (
    <nav
      className={cn(
        variant === "sidebar" ? "flex flex-col gap-1.5 px-3" : "flex flex-wrap items-center gap-1.5",
      )}
      aria-label="صفحات المحل"
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        const on = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border text-sm font-semibold transition",
              variant === "sidebar" ? "w-full px-3 py-2.5" : "px-3 py-2",
              on
                ? "border-[var(--salla-primary)] bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#1d1e20]"
                : "border-[var(--salla-border)] bg-[var(--salla-surface)] text-[#0f172a] hover:border-[var(--salla-primary)] hover:text-[var(--salla-primary)] dark:bg-[var(--salla-soft)] dark:text-[#f4f4f5]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
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
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-[var(--salla-bg)] text-[var(--foreground)]">
      <aside className="shell-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col py-5 lg:flex lg:flex-col">
        <div className="mb-6 flex items-center gap-3 px-5">
          <BrandLogo />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--salla-primary)]">محل زينب</p>
            <p className="truncate text-xs text-[var(--salla-muted)]">تأجير فساتين</p>
          </div>
        </div>
        <NavLinks active={active} variant="sidebar" />
        <div className="mt-auto px-5 pt-6">
          <p className="text-xs leading-5 text-[var(--salla-muted)]">
            {isOwner ? "لوحة التحكم، العميلات، والحجوزات" : "الحجوزات وملفات العميلات"}
          </p>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
          />
          <aside className="shell-sidebar absolute inset-y-0 start-0 flex w-72 flex-col py-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <BrandLogo />
                <p className="font-semibold text-[var(--salla-primary)]">محل زينب</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
                aria-label="إغلاق"
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
                  aria-label="فتح القائمة"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0 lg:hidden">
                  <h1 className="truncate text-base font-semibold text-[var(--foreground)]">{TITLES[active]}</h1>
                </div>
                <p className="hidden text-sm font-semibold text-[var(--foreground)] lg:block">{TITLES[active]}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle />
                <RoleSwitcher />
              </div>
            </div>

            {/* Always-visible page buttons */}
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
