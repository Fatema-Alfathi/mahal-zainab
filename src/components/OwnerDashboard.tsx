"use client";

import { useState } from "react";
import { DiscountPolicyPanel } from "@/components/DiscountPolicyPanel";
import { DressGrid } from "@/components/DressGrid";
import { DressRoiTable } from "@/components/DressRoiTable";
import { FixedCostBreakdown } from "@/components/FixedCostBreakdown";
import { OwnerSnapshot } from "@/components/OwnerSnapshot";
import { VariableExpenseLog } from "@/components/VariableExpenseLog";
import { cn } from "@/lib/format";

const TABS = [
  { id: "floor", label: "الصالة" },
  { id: "money", label: "الحسابات" },
  { id: "roi", label: "أرباح الفساتين" },
  { id: "discount", label: "خصم الموظفات" },
] as const;

type OwnerTab = (typeof TABS)[number]["id"];

export function OwnerDashboard() {
  const [tab, setTab] = useState<OwnerTab>("floor");

  return (
    <div className="space-y-8">
      <OwnerSnapshot />

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
