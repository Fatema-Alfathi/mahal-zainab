"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useShop } from "@/context/ShopContext";
import { cn } from "@/lib/format";

export function BoutiqueHeader({ active = "home" }: { active?: "home" | "dresses" }) {
  const { isOwner } = useShop();
  const onDresses = active === "dresses";

  return (
    <header className="sticky top-0 z-30 border-b border-rose-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-pink-400 to-amber-300 text-white shadow-md shadow-rose-300/50">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-2xl text-rose-800">محل زينب</p>
            <p className="text-sm text-rose-500">تأجير فساتين الزفاف والسهرات</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="صفحات المحل">
          <Link
            href="/"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              !onDresses ? "shop-btn shadow-sm" : "bg-rose-50 text-rose-600 hover:bg-rose-100",
            )}
          >
            لوحة المحل
          </Link>
          <Link
            href="/dresses"
            className={cn(
              "rounded-2xl px-3 py-1.5 transition",
              onDresses ? "shop-btn shadow-sm" : "bg-rose-50 text-rose-600 hover:bg-rose-100",
            )}
          >
            إدارة الفساتين
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RoleSwitcher />
          <p className="text-sm text-rose-400">
            {isOwner ? "الصالة والحسابات في تبويبات واضحة" : "التوفر والحجوزات فقط"}
          </p>
        </div>
      </div>
    </header>
  );
}
