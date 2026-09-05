"use client";

import { useMemo, useState } from "react";
import { DiscountPolicyPanel } from "@/components/DiscountPolicyPanel";
import { DressGrid } from "@/components/DressGrid";
import { DressRoiTable } from "@/components/DressRoiTable";
import { FixedCostBreakdown } from "@/components/FixedCostBreakdown";
import { VariableExpenseLog } from "@/components/VariableExpenseLog";
import { useShop } from "@/context/ShopContext";
import { grossRevenue, netProfit, totalOperatingExpenses } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/format";

const TABS = [
  { id: "floor", label: "الصالة" },
  { id: "money", label: "الحسابات" },
  { id: "roi", label: "أرباح الفساتين" },
  { id: "discount", label: "خصم الموظفات" },
] as const;

type OwnerTab = (typeof TABS)[number]["id"];

export function OwnerDashboard() {
  const { dresses, bookings, fixedExpenses, variableExpenses } = useShop();
  const [tab, setTab] = useState<OwnerTab>("floor");
  const revenue = grossRevenue(bookings);
  const spend = totalOperatingExpenses(fixedExpenses, variableExpenses);
  const profit = netProfit(bookings, fixedExpenses, variableExpenses);
  const counts = useMemo(
    () => ({
      available: dresses.filter((dress) => dress.status === "available").length,
      rented: dresses.filter((dress) => dress.status === "rented").length,
      maintenance: dresses.filter((dress) => dress.status === "maintenance").length,
    }),
    [dresses],
  );

  return (
    <div className="space-y-8">
      <section className="shop-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-rose-400">نظرة سريعة</p>
            <h2 className="mt-1 text-2xl font-medium text-rose-900 sm:text-3xl">محل زينب اليوم</h2>
            <p className="mt-2 text-sm leading-7 text-rose-600/80">
              {profit >= 0
                ? "الدخل يغطي المصروفات، والمحل رابح."
                : "المصروفات أعلى من دخل التأجير حالياً."}
            </p>
          </div>
          <p className="text-sm text-rose-500">
            متاح {counts.available} · مؤجَّر {counts.rented} · صيانة {counts.maintenance}
          </p>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <GlanceStat label="دخل التأجير" value={revenue} tint="rose" />
          <GlanceStat label="المصروفات" value={spend} tint="gold" />
          <GlanceStat label="الباقي ربح" value={profit} emphasize tint="mint" />
        </dl>
      </section>

      <div className="-mx-1 overflow-x-auto px-1">
        <div className="inline-flex min-w-full rounded-2xl bg-white/80 p-1 shadow-sm ring-1 ring-rose-100 backdrop-blur-md sm:min-w-0" role="tablist" aria-label="أقسام لوحة المالك">
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition sm:px-4",
                  selected ? "shop-btn shadow-sm" : "text-rose-400 hover:bg-rose-50 hover:text-rose-700",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "floor" ? <DressGrid /> : null}
      {tab === "money" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <FixedCostBreakdown />
          <VariableExpenseLog />
        </div>
      ) : null}
      {tab === "roi" ? <DressRoiTable /> : null}
      {tab === "discount" ? <DiscountPolicyPanel /> : null}
    </div>
  );
}

function GlanceStat({
  label,
  value,
  emphasize = false,
  tint,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
  tint: "rose" | "gold" | "mint";
}) {
  const profit = emphasize && value >= 0;
  const loss = emphasize && value < 0;
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3",
        tint === "rose" && "bg-rose-50",
        tint === "gold" && "bg-amber-50",
        tint === "mint" && "bg-emerald-50",
      )}
    >
      <dt className="text-xs text-rose-400">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-xl tabular-nums sm:text-2xl",
          profit ? "text-emerald-600" : loss ? "text-rose-600" : "text-rose-900",
        )}
      >
        {emphasize && value < 0 ? `−${formatCurrency(Math.abs(value))}` : formatCurrency(Math.abs(value))}
      </dd>
    </div>
  );
}
