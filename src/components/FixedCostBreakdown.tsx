"use client";

import { Building2, Laptop, Users } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { totalFixedExpenses } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const ICONS: Record<string, typeof Building2> = {
  "إيجار المحل": Building2,
  "رواتب الموظفين": Users,
  "اشتراكات البرامج": Laptop,
};

export function FixedCostBreakdown() {
  const { fixedExpenses } = useShop();
  const total = totalFixedExpenses(fixedExpenses);

  return (
    <section className="shop-card rounded-3xl p-6">
      <div className="mb-5">
        <p className="text-sm text-rose-400">كل شهر ثابت</p>
        <h3 className="mt-1 text-2xl font-medium text-rose-900">إيجار ورواتب</h3>
        <p className="mt-2 text-sm leading-7 text-rose-600/80">هذي تطلع كل شهر، سواء أجّرتِ أو لا.</p>
      </div>
      <ul className="space-y-3">
        {fixedExpenses.map((expense) => {
          const Icon = ICONS[expense.name] ?? Building2;
          return (
            <li key={expense.id} className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-400">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm text-rose-900">{expense.name}</p>
              </div>
              <p className="tabular-nums text-rose-800">{formatCurrency(expense.amount)}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-rose-100 pt-4 text-sm">
        <span className="text-rose-400">المجموع كل شهر</span>
        <span className="tabular-nums text-rose-800">{formatCurrency(total)}</span>
      </div>
    </section>
  );
}
