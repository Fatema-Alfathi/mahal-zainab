"use client";

import { Sparkles } from "lucide-react";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useShop } from "@/context/ShopContext";

export function BoutiqueHeader() {
  const { isOwner } = useShop();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/50 bg-[#f3f1ee]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8e2db] text-stone-600">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-2xl text-stone-800">محل زينب</p>
            <p className="text-sm text-stone-500">تأجير فساتين الزفاف والسهرات</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RoleSwitcher />
          <p className="text-sm text-stone-500">
            {isOwner ? "حسابات المحل والمخزون" : "التوفر والحجوزات فقط"}
          </p>
        </div>
      </div>
    </header>
  );
}
