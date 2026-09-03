"use client";

import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { DressGrid } from "@/components/DressGrid";
import { DressRoiTable } from "@/components/DressRoiTable";
import { FinancialNerveCenter } from "@/components/FinancialNerveCenter";
import { FixedCostBreakdown } from "@/components/FixedCostBreakdown";
import { VariableExpenseLog } from "@/components/VariableExpenseLog";
import { useShop } from "@/context/ShopContext";

export function BoutiqueApp() {
  const { isOwner } = useShop();

  return (
    <div className="min-h-full bg-[#f3f1ee] text-stone-700">
      <BoutiqueHeader />
      <main className="mx-auto max-w-6xl space-y-12 px-5 py-10 lg:px-8">
        {isOwner ? (
          <>
            <FinancialNerveCenter />
            <div className="grid gap-6 xl:grid-cols-2">
              <FixedCostBreakdown />
              <VariableExpenseLog />
            </div>
            <DressRoiTable />
          </>
        ) : (
          <section className="rounded-3xl bg-white/80 px-6 py-5 text-sm leading-7 text-stone-500">
            صلاحية الموظف تقتصر على حالة الفساتين والحجوزات. الأسعار والرواتب والمصروفات مخفية.
          </section>
        )}
        <DressGrid />
      </main>
    </div>
  );
}
