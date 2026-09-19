"use client";

import { useState } from "react";
import {
  CalendarRange,
  FileText,
  LayoutDashboard,
  Shirt,
  Users,
  Wallet,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { DressGrid } from "@/components/DressGrid";
import { EmployeeManager } from "@/components/EmployeeManager";
import { GovernmentRecords } from "@/components/GovernmentRecords";
import { DressRoiTable } from "@/components/DressRoiTable";
import { FixedCostBreakdown } from "@/components/FixedCostBreakdown";
import { CustomerManager } from "@/components/CustomerManager";
import { OwnerHistory } from "@/components/OwnerHistory";
import { OwnerSnapshot } from "@/components/OwnerSnapshot";
import { VariableExpenseLog } from "@/components/VariableExpenseLog";
import { cn } from "@/lib/format";
import { useLanguage } from "@/i18n/LanguageProvider";

const TABS = [
  { id: "overview", icon: LayoutDashboard },
  { id: "floor", icon: Shirt },
  { id: "customers", icon: Users },
  { id: "months", icon: CalendarRange },
  { id: "money", icon: Wallet },
  { id: "roi", icon: TrendingUp },
  { id: "staff", icon: UserRound },
  { id: "permits", icon: FileText },
] as const;

type OwnerTab = (typeof TABS)[number]["id"];

export function OwnerDashboard() {
  const [tab, setTab] = useState<OwnerTab>("overview");
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="inline-flex min-w-full gap-1 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-surface)] p-1.5 sm:min-w-0"
          role="tablist"
          aria-label={t("tab.aria")}
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
                <span>{t(`tab.${item.id}`)}</span>
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
            <p className="text-sm font-medium text-[var(--salla-primary)]">{t("tab.money")}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {t("tab.money")}
            </h2>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <FixedCostBreakdown />
            <VariableExpenseLog />
          </div>
        </div>
      ) : null}
      {tab === "roi" ? <DressRoiTable /> : null}
      {tab === "staff" ? <EmployeeManager /> : null}
      {tab === "permits" ? <GovernmentRecords /> : null}
    </div>
  );
}
