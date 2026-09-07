"use client";

import { useMemo } from "react";
import { useShop } from "@/context/ShopContext";
import { ownerHistory, ownerSnapshot } from "@/lib/ownerSnapshot";
import { cn, formatCurrency } from "@/lib/format";
import { comparisonLabel } from "@/lib/labels";

export function OwnerSnapshot() {
  const { dresses, bookings, fixedExpenses, variableExpenses } = useShop();
  const snap = useMemo(
    () => ownerSnapshot(dresses, bookings, fixedExpenses, variableExpenses),
    [bookings, dresses, fixedExpenses, variableExpenses],
  );
  const history = useMemo(
    () => ownerHistory(bookings, fixedExpenses, variableExpenses),
    [bookings, fixedExpenses, variableExpenses],
  );

  return (
    <section className="shop-card rounded-3xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-rose-400">نظرة سريعة</p>
          <h2 className="mt-1 text-2xl font-medium text-rose-900 sm:text-3xl">محل زينب اليوم</h2>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">
            {snap.monthProfit >= 0
              ? `دخل ${snap.thisMonthLabel} حتى اليوم يغطي المصروفات.`
              : `مصروفات ${snap.thisMonthLabel} حتى اليوم أعلى من دخل التأجير.`}
          </p>
        </div>
        <p className="text-sm text-rose-500">
          متاح {snap.availableDresses} · محجوز {snap.reservedDresses} · عند العميلات {snap.rentedDresses}
        </p>
      </div>

      <h3 className="mt-6 text-sm text-rose-400">إجمالي الدخل</h3>
      <dl className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyStat label="اليوم" value={snap.todayIncome} tint="rose" />
        <MoneyStat label="هذا الأسبوع" value={snap.weekIncome} tint="rose" />
        <MoneyStat label={`شهر ${snap.thisMonthLabel}`} value={snap.monthIncome} tint="rose" />
        <MoneyStat label="هذه السنة" value={snap.yearIncome} tint="rose" />
      </dl>

      <h3 className="mt-6 text-sm text-rose-400">حسابات {snap.thisMonthLabel} حتى اليوم</h3>
      <dl className="mt-2 grid gap-3 sm:grid-cols-3">
        <MoneyStat label="إجمالي المصروفات" value={snap.monthExpenses} tint="gold" />
        <MoneyStat label="صافي الربح" value={snap.monthProfit} emphasize tint="mint" />
        <CountStat label="عدد الحجوزات" value={snap.monthBookings} hint={`${snap.yearBookings} حجز هذه السنة`} />
      </dl>

      <h3 className="mt-6 text-sm text-rose-400">عربون ومتبقي</h3>
      <dl className="mt-2 grid gap-3 sm:grid-cols-2">
        <MoneyStat label="المبالغ المتبقية على العميلات" value={snap.remainingDue} tint="gold" />
        <MoneyStat label="العربون المدفوع من العميلات" value={snap.depositsPaid} tint="mint" />
      </dl>

      <h3 className="mt-6 text-sm text-rose-400">حالة الفساتين</h3>
      <dl className="mt-2 grid gap-3 sm:grid-cols-3">
        <CountStat label="فساتين متاحة" value={snap.availableDresses} />
        <CountStat label="فساتين محجوزة" value={snap.reservedDresses} hint="محجوزة ولسه في المحل" />
        <CountStat label="عند العميلات" value={snap.rentedDresses} hint="مسلَّمة وخارج المحل" />
      </dl>

      <div className="mt-6 rounded-2xl bg-rose-50/80 px-4 py-4">
        <p className="text-sm text-rose-400">مقارنة {snap.thisMonthLabel} بـ {snap.lastMonthLabel}</p>
        <p className="mt-1 text-xs text-rose-400">نفس عدد الأيام من أول الشهر حتى اليوم.</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CompareStat
            label="الدخل"
            current={snap.comparison.income.current}
            previous={snap.comparison.income.previous}
            change={snap.comparison.income.change}
            money
          />
          <CompareStat
            label="المصروفات"
            current={snap.comparison.expenses.current}
            previous={snap.comparison.expenses.previous}
            change={snap.comparison.expenses.change}
            money
            invert
          />
          <CompareStat
            label="صافي الربح"
            current={snap.comparison.profit.current}
            previous={snap.comparison.profit.previous}
            change={snap.comparison.profit.change}
            money
          />
          <CompareStat
            label="الحجوزات"
            current={snap.comparison.bookings.current}
            previous={snap.comparison.bookings.previous}
            change={snap.comparison.bookings.change}
          />
        </dl>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          أعلى شهر دخل: {history.highestIncomeMonth?.label ?? "—"}
          {history.highestIncomeMonth
            ? ` · ${history.highestIncomeMonth.income < 0 ? `−${formatCurrency(Math.abs(history.highestIncomeMonth.income))}` : formatCurrency(history.highestIncomeMonth.income)}`
            : ""}
        </p>
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          أقل شهر دخل: {history.lowestIncomeMonth?.label ?? "—"}
          {history.lowestIncomeMonth ? ` · ${formatCurrency(history.lowestIncomeMonth.income)}` : ""}
        </p>
      </div>
    </section>
  );
}

function MoneyStat({
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
        {value < 0 ? `−${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
      </dd>
    </div>
  );
}

function CountStat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-rose-100">
      <dt className="text-xs text-rose-400">{label}</dt>
      <dd className="mt-1 text-xl tabular-nums text-rose-900 sm:text-2xl">{value}</dd>
      {hint ? <p className="mt-1 text-xs text-rose-300">{hint}</p> : null}
    </div>
  );
}

function CompareStat({
  label,
  current,
  previous,
  change,
  money = false,
  invert = false,
}: {
  label: string;
  current: number;
  previous: number;
  change: number;
  money?: boolean;
  invert?: boolean;
}) {
  const up = change > 0.05;
  const down = change < -0.05;
  const good = invert ? down : up;
  const bad = invert ? up : down;
  const format = (value: number) =>
    money
      ? value < 0
        ? `−${formatCurrency(Math.abs(value))}`
        : formatCurrency(value)
      : String(value);
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <dt className="text-xs text-rose-400">{label}</dt>
      <dd className="mt-1 text-lg tabular-nums text-rose-900">{format(current)}</dd>
      <p className="mt-1 text-[11px] text-rose-300">الشهر الماضي {format(previous)}</p>
      <p
        className={cn(
          "mt-1 text-xs",
          good && "text-emerald-600",
          bad && "text-rose-600",
          !good && !bad && "text-rose-400",
        )}
      >
        {comparisonLabel(change)}
      </p>
    </div>
  );
}
