"use client";

import { Building2, Laptop, Users } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { totalFixedExpenses } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { FREQUENCY_LABELS } from "@/lib/labels";

const ICONS: Record<string, typeof Building2> = {
  "إيجار المحل": Building2,
  "رواتب الموظفين": Users,
  "اشتراكات البرامج": Laptop,
};

export function FixedCostBreakdown() {
  const { fixedExpenses } = useShop();
  const total = totalFixedExpenses(fixedExpenses);

  return (
    <section className="rounded-3xl bg-white/80 p-6">
      <div className="mb-5">
        <p className="text-sm text-stone-400">نفقات شهرية ثابتة</p>
        <h3 className="mt-1 text-2xl font-medium text-stone-800">التكاليف الثابتة</h3>
        <p className="mt-2 text-sm leading-7 text-stone-500">
          أعباء متكررة يجب تغطيتها قبل أن يحقق المحل ربحاً تشغيلياً.
        </p>
      </div>
      <ul className="space-y-3">
        {fixedExpenses.map((expense) => {
          const Icon = ICONS[expense.name] ?? Building2;
          const share = total === 0 ? 0 : (expense.amount / total) * 100;
          return (
            <li key={expense.id} className="rounded-2xl bg-[#f3f1ee]/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-500">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm text-stone-800">{expense.name}</p>
                    <p className="text-xs text-stone-400">{FREQUENCY_LABELS[expense.frequency]}</p>
                  </div>
                </div>
                <p className="text-lg tabular-nums text-stone-800">{formatCurrency(expense.amount)}</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-stone-300" style={{ width: `${share}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
        <span className="text-stone-500">إجمالي الثابت / الشهر</span>
        <span className="tabular-nums text-stone-800">{formatCurrency(total)}</span>
      </div>
    </section>
  );
}
