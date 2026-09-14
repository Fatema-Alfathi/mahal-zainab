"use client";

import { useState } from "react";
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

const TAB_IDS = ["overview", "floor", "customers", "months", "money", "roi", "staff", "permits"] as const;

type OwnerTab = (typeof TAB_IDS)[number];

export function OwnerDashboard() {
  const [tab, setTab] = useState<OwnerTab>("overview");
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="-mx-1 overflow-x-auto px-1">
        <div
          className="inline-flex min-w-full rounded-2xl bg-white p-1 shadow-sm ring-2 ring-[#8b1530] sm:min-w-0"
          role="tablist"
          aria-label={t("tab.aria")}
        >
          {TAB_IDS.map((id) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition sm:px-4",
                  selected ? "shop-btn shadow-sm" : "font-medium text-rose-700 hover:bg-rose-50",
                )}
              >
                {t(`tab.${id}`)}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <FixedCostBreakdown />
          <VariableExpenseLog />
        </div>
      ) : null}
      {tab === "roi" ? <DressRoiTable /> : null}
      {tab === "staff" ? <EmployeeManager /> : null}
      {tab === "permits" ? <GovernmentRecords /> : null}
    </div>
  );
}
