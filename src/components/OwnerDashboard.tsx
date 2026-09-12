"use client";

import { useState } from "react";
import {
  CalendarRange,
  LayoutDashboard,
  Shirt,
  Users,
  Wallet,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { DressGrid } from "@/components/DressGrid";
import { EmployeeManager } from "@/components/EmployeeManager";
import { DressRoiTable } from "@/components/DressRoiTable";
import { FixedCostBreakdown } from "@/components/FixedCostBreakdown";
import { CustomerManager } from "@/components/CustomerManager";
import { OwnerHistory } from "@/components/OwnerHistory";
import { OwnerSnapshot } from "@/components/OwnerSnapshot";
import { VariableExpenseLog } from "@/components/VariableExpenseLog";
import { cn } from "@/lib/format";

const TABS = [
  { id: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "floor", label: "الصالة", icon: Shirt },
  { id: "customers", label: "العميلات", icon: Users },
  { id: "months", label: "الأشهر والسنوات", icon: CalendarRange },
  { id: "money", label: "الحسابات", icon: Wallet },
  { id: "roi", label: "أرباح الفساتين", icon: TrendingUp },
  { id: "staff", label: "الموظفات", icon: UserRound },
] as const;

type OwnerTab = (typeof TABS)[number]["id"];

export function OwnerDashboard() {
  const [tab, setTab] = useState<OwnerTab>("overview");

  return (
    <div className="space-y-6">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="inline-flex min-w-full gap-1 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-surface)] p-1.5 sm:min-w-0"
          role="tablist"
          aria-label="أقسام لوحة المالك"
        >
          {TABS.map((item) => {
            const Icon = item.icon;
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  selected
                    ? "bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#200000]"
                    : "text-[var(--salla-muted)] hover:bg-[var(--salla-soft)] hover:text-[var(--salla-primary)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" ? <OwnerSnapshot /> : null}
      {tab === "floor" ? <DressGrid /> : null}
      {tab === "customers" ? <CustomerManager /> : null}
      {tab === "months" ? <OwnerHistory /> : null}
      {tab === "money" ? (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[var(--salla-primary)]">المالية</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">الحسابات</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
              المصاريف الشهرية الثابتة والمصروفات اليومية في مكان واحد.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <FixedCostBreakdown />
            <VariableExpenseLog />
          </div>
        </div>
      ) : null}
      {tab === "roi" ? <DressRoiTable /> : null}
      {tab === "staff" ? <EmployeeManager /> : null}
    </div>
  );
}
