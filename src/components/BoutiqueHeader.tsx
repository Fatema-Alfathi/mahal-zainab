"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useShop } from "@/context/ShopContext";
import { cn } from "@/lib/format";

export function BoutiqueHeader({ active = "home" }: { active?: "home" | "dresses" | "customers" | "calendar" }) {
  const { isOwner } = useShop();
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
            <p className="font-serif text-2xl text-white">محل زينب</p>
            <p className="text-sm font-medium text-[#ffd76a]">تأجير فساتين الزفاف والسهرات</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="صفحات المحل">
          <Link
            href="/"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onHome ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            لوحة المحل
          </Link>
          <Link
            href="/customers"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onCustomers ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            العميلات
          </Link>
          <Link
            href="/calendar"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onCalendar ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            التقويم
          </Link>
          <Link
            href="/dresses"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onDresses ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/15",
            )}
          >
            إدارة الفساتين
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RoleSwitcher />
          <p className="text-sm font-medium text-[#ffd76a]">
            {isOwner ? "لوحة التحكم، العميلات، والحجوزات" : "الحجوزات وملفات العميلات"}
          </p>
        </div>
      </div>
    </header>
  );
}
