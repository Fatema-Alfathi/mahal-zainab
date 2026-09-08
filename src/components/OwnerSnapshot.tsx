"use client";

import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  Shirt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useShop } from "@/context/ShopContext";
import { ownerHistory, ownerSnapshot } from "@/lib/ownerSnapshot";
import { comparisonLabel } from "@/lib/labels";
import {
  cn,
  formatCurrency,
  formatDateLong,
  formatSignedCurrency,
  monthNameShortAr,
  todayIso,
} from "@/lib/format";

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
  const recentMonths = history.months.slice(-12);
  const maxMonthIncome = Math.max(...recentMonths.map((row) => row.income), 1);
  const dressTotal = Math.max(snap.totalDresses, 1);

  return (
    <section className="space-y-5">
      <div className="dash-hero dash-panel rounded-3xl px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <BrandLogo size="md" />
            <div>
              <p className="text-sm text-[#ebd8bb]/75">لوحة تحكم المالك</p>
              <h2 className="mt-2 font-serif text-3xl text-[#ffe9d9] sm:text-4xl">محل زينب</h2>
              <p className="mt-2 text-sm text-[#ebd8bb]/70" suppressHydrationWarning>
                {formatDateLong(todayIso())}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#ebd8bb]/85">
                {snap.monthProfit >= 0
                  ? `دخل ${snap.thisMonthLabel} حتى اليوم يغطي المصروفات، والمحل رابح.`
                  : `مصروفات ${snap.thisMonthLabel} حتى اليوم أعلى من دخل التأجير.`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniChip label="متاح" value={snap.availableDresses} tone="mint" />
            <MiniChip label="محجوز" value={snap.reservedDresses} tone="sky" />
            <MiniChip label="عند العميلة" value={snap.rentedDresses} tone="gold" />
          </div>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label={`دخل ${snap.thisMonthLabel}`}
          value={formatCurrency(snap.monthIncome)}
          hint="حتى اليوم"
          icon={CircleDollarSign}
          change={snap.comparison.income.change}
        />
        <Kpi
          label="المصروفات"
          value={formatCurrency(snap.monthExpenses)}
          hint="ثابت ومتغير هذا الشهر"
          icon={Wallet}
          change={snap.comparison.expenses.change}
          invert
        />
        <Kpi
          label="صافي الربح"
          value={formatSignedCurrency(snap.monthProfit)}
          hint={snap.monthProfit >= 0 ? "بعد المصروفات" : "المصروفات أعلى حالياً"}
          icon={TrendingUp}
          change={snap.comparison.profit.change}
          emphasize={snap.monthProfit >= 0 ? "good" : "bad"}
        />
        <Kpi
          label="الحجوزات"
          value={String(snap.monthBookings)}
          hint={`${snap.yearBookings} حجز هذه السنة`}
          icon={CalendarDays}
          change={snap.comparison.bookings.change}
        />
      </dl>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="dash-panel rounded-3xl p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg text-rose-900">الدخل عبر الفترات</h3>
              <p className="mt-1 text-xs text-rose-400">اليوم، الأسبوع، الشهر، والسنة</p>
            </div>
            <CalendarRange className="h-4 w-4 text-rose-300" aria-hidden />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <PeriodCard label="اليوم" value={snap.todayIncome} />
            <PeriodCard label="هذا الأسبوع" value={snap.weekIncome} />
            <PeriodCard label={`شهر ${snap.thisMonthLabel}`} value={snap.monthIncome} />
            <PeriodCard label="هذه السنة" value={snap.yearIncome} />
          </dl>
        </div>

        <div className="dash-panel rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg text-rose-900">مخزون الفساتين</h3>
              <p className="mt-1 text-xs text-rose-400">{snap.totalDresses} فستان في المحل</p>
            </div>
            <Shirt className="h-4 w-4 text-rose-300" aria-hidden />
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-rose-50">
            <span className="bg-emerald-400" style={{ width: `${(snap.availableDresses / dressTotal) * 100}%` }} />
            <span className="bg-sky-400" style={{ width: `${(snap.reservedDresses / dressTotal) * 100}%` }} />
            <span className="bg-amber-400" style={{ width: `${(snap.rentedDresses / dressTotal) * 100}%` }} />
            <span className="bg-violet-400" style={{ width: `${(snap.maintenanceDresses / dressTotal) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <DressRow label="متاحة" value={snap.availableDresses} color="bg-emerald-400" />
            <DressRow label="محجوزة في المحل" value={snap.reservedDresses} color="bg-sky-400" />
            <DressRow label="عند العميلات" value={snap.rentedDresses} color="bg-amber-400" />
            <DressRow label="صيانة" value={snap.maintenanceDresses} color="bg-violet-400" />
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dash-panel rounded-3xl p-5">
          <h3 className="text-lg text-rose-900">عربون وتأمين ومتبقي</h3>
          <p className="mt-1 text-xs text-rose-400">العربون من الإيجار، والتأمين عند المحل لين يرجع الفستان سليم</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <PeriodCard label="عربون مدفوع" value={snap.depositsPaid} tone="mint" />
            <PeriodCard label="تأمين عند المحل" value={snap.insuranceHeld} tone="mint" />
            <PeriodCard label="متبقي على العميلات" value={snap.remainingDue} tone="gold" />
          </dl>
        </div>
        <div className="dash-panel rounded-3xl p-5">
          <h3 className="text-lg text-rose-900">مقارنة {snap.thisMonthLabel} بـ {snap.lastMonthLabel}</h3>
          <p className="mt-1 text-xs text-rose-400">نفس عدد الأيام من أول الشهر حتى اليوم</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <CompareCard label="الدخل" current={snap.comparison.income.current} previous={snap.comparison.income.previous} change={snap.comparison.income.change} money />
            <CompareCard label="المصروفات" current={snap.comparison.expenses.current} previous={snap.comparison.expenses.previous} change={snap.comparison.expenses.change} money invert />
            <CompareCard label="صافي الربح" current={snap.comparison.profit.current} previous={snap.comparison.profit.previous} change={snap.comparison.profit.change} money />
            <CompareCard label="الحجوزات" current={snap.comparison.bookings.current} previous={snap.comparison.bookings.previous} change={snap.comparison.bookings.change} />
          </dl>
        </div>
      </div>

      <div className="dash-panel rounded-3xl p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg text-rose-900">حركة الدخل الشهرية</h3>
            <p className="mt-1 text-xs text-rose-400">آخر {recentMonths.length} شهر · الأعلى والأقل مميزين</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              أعلى: {history.highestIncomeMonth?.label ?? "—"}
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
              أقل: {history.lowestIncomeMonth?.label ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex h-44 items-end gap-1.5 sm:gap-2.5">
          {recentMonths.map((row) => {
            const high = history.highestIncomeMonth?.key === row.key;
            const low = history.lowestIncomeMonth?.key === row.key;
            const height = Math.max(8, (row.income / maxMonthIncome) * 100);
            return (
              <div key={row.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end justify-center">
                  <div
                    title={`${row.label}: ${formatCurrency(row.income)}`}
                    className={cn(
                      "w-full max-w-8 rounded-t-lg sm:max-w-10",
                      high ? "bg-emerald-400" : low ? "bg-amber-300" : "bg-gradient-to-t from-[#2d0503] to-[#ebd8bb]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-rose-400">{monthNameShortAr(`${row.key}-01`)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MiniChip({ label, value, tone }: { label: string; value: number; tone: "mint" | "sky" | "gold" }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-2",
        tone === "mint" && "bg-emerald-400/18 ring-1 ring-emerald-300/25",
        tone === "sky" && "bg-[#ebd8bb]/12 ring-1 ring-[#ebd8bb]/25",
        tone === "gold" && "bg-[#ebd8bb]/20 ring-1 ring-[#ebd8bb]/35",
      )}
    >
      <p className="text-[11px] text-[#ebd8bb]/70">{label}</p>
      <p className="mt-0.5 text-lg tabular-nums text-[#ffe9d9]">{value}</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  change,
  invert = false,
  emphasize,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  change: number;
  invert?: boolean;
  emphasize?: "good" | "bad";
}) {
  const up = change > 0.05;
  const down = change < -0.05;
  const good = invert ? down : up;
  return (
    <div className="dash-panel rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-rose-400">{label}</p>
          <p
            className={cn(
              "mt-2 text-2xl tabular-nums tracking-tight",
              emphasize === "good" && "text-emerald-600",
              emphasize === "bad" && "text-rose-600",
              !emphasize && "text-rose-900",
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-2 text-xs text-rose-300">{hint}</p>
      <p className={cn("mt-2 inline-flex items-center gap-1 text-xs", good ? "text-emerald-600" : down || up ? "text-rose-500" : "text-rose-400")}>
        {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : null}
        {down ? <ArrowDownRight className="h-3.5 w-3.5" aria-hidden /> : null}
        {comparisonLabel(change)}
      </p>
    </div>
  );
}

function PeriodCard({
  label,
  value,
  tone = "rose",
}: {
  label: string;
  value: number;
  tone?: "rose" | "gold" | "mint";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3",
        tone === "rose" && "bg-rose-50/80",
        tone === "gold" && "bg-amber-50",
        tone === "mint" && "bg-emerald-50",
      )}
    >
      <dt className="text-xs text-rose-400">{label}</dt>
      <dd className="mt-1 text-xl tabular-nums text-rose-900">{formatCurrency(value)}</dd>
    </div>
  );
}

function DressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-rose-700">
        <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
        {label}
      </span>
      <span className="tabular-nums text-rose-900">{value}</span>
    </li>
  );
}

function CompareCard({
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
  const format = (value: number) => (money ? formatSignedCurrency(value) : String(value));
  return (
    <div className="rounded-2xl bg-rose-50/70 px-3 py-3">
      <dt className="text-xs text-rose-400">{label}</dt>
      <dd className="mt-1 text-lg tabular-nums text-rose-900">{format(current)}</dd>
      <p className="mt-1 text-[11px] text-rose-300">الشهر الماضي {format(previous)}</p>
      <p className={cn("mt-1 text-xs", good ? "text-emerald-600" : down || up ? "text-rose-500" : "text-rose-400")}>
        {comparisonLabel(change)}
      </p>
    </div>
  );
}
