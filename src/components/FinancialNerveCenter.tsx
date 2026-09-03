"use client";

import { Banknote, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { useShop } from "@/context/ShopContext";
import {
  grossRevenue,
  netProfit,
  sumByCategory,
  totalFixedExpenses,
  totalOperatingExpenses,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

export function FinancialNerveCenter() {
  const { bookings, fixedExpenses, variableExpenses } = useShop();
  const revenue = grossRevenue(bookings);
  const opex = totalOperatingExpenses(fixedExpenses, variableExpenses);
  const profit = netProfit(bookings, fixedExpenses, variableExpenses);
  const profitable = profit >= 0;
  const marketing = sumByCategory(variableExpenses, "Marketing Campaign");
  const cleaning = sumByCategory(variableExpenses, "Dry Cleaning");
  const repairs = sumByCategory(variableExpenses, "Dress Repair");
  const utilities = sumByCategory(variableExpenses, "Utility Bills");
  const other = sumByCategory(variableExpenses, "Other");
  const fixedTotal = totalFixedExpenses(fixedExpenses);
  const revenueShare = revenue + opex === 0 ? 0 : (revenue / Math.max(revenue, opex)) * 100;
  const opexShare = revenue + opex === 0 ? 0 : (opex / Math.max(revenue, opex)) * 100;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-stone-400">ملخص الحسابات</p>
        <h2 className="mt-1 text-3xl font-medium text-stone-800">أرباح وخسائر المحل</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
          أسعار شراء الفساتين رأس مال وتظهر في عائد كل فستان، وليست ضمن مصروفات التشغيل الشهرية.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="الإيراد الإجمالي"
          value={revenue}
          hint="كل المبالغ المحصّلة من تأجير الفساتين، بما فيها الحجوزات النشطة."
          icon={Banknote}
          tone="rose"
        />
        <MetricCard
          label="إجمالي مصروفات التشغيل"
          value={opex}
          hint="الإيجار والرواتب والبرامج والتسويق والتنظيف الجاف والإصلاحات وفواتير الخدمات."
          icon={Wallet}
        />
        <MetricCard
          label="صافي الربح"
          value={profit}
          hint={
            profitable
              ? "الإيرادات تغطي مصروفات التشغيل لهذه الفترة."
              : "مصروفات التشغيل حالياً أعلى من حصيلة التأجير."
          }
          icon={profitable ? TrendingUp : TrendingDown}
          tone={profitable ? "profit" : "loss"}
        />
      </div>
      <div className="rounded-3xl bg-white/80 p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <Landmark className="h-4 w-4 text-stone-400" aria-hidden />
            الإيرادات مقابل مصروفات التشغيل
          </div>
          <p className="text-xs text-stone-500">لقطة الدفتر الحالية</p>
        </div>
        <div className="space-y-3">
          <BarRow label="الإيراد الإجمالي" amount={revenue} width={Math.min(100, revenueShare)} tone="teal" />
          <BarRow label="إجمالي التشغيل" amount={opex} width={Math.min(100, opexShare)} tone="stone" />
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <OpexChip label="ثابت شهري" value={fixedTotal} />
          <OpexChip label="التسويق" value={marketing} />
          <OpexChip label="التنظيف الجاف" value={cleaning} />
          <OpexChip label="الإصلاحات" value={repairs} />
          <OpexChip label="خدمات وأخرى" value={utilities + other} />
        </dl>
      </div>
    </section>
  );
}

function BarRow({
  label,
  amount,
  width,
  tone,
}: {
  label: string;
  amount: number;
  width: number;
  tone: "teal" | "stone";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="tabular-nums text-stone-800">{formatCurrency(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#f3f1ee]">
        <div
          className={tone === "teal" ? "h-full rounded-full bg-teal-700/80" : "h-full rounded-full bg-stone-300"}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function OpexChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#f3f1ee] px-3 py-2">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-0.5 tabular-nums text-stone-800">{formatCurrency(value)}</dd>
    </div>
  );
}
