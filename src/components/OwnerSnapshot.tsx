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
      {/* Welcome strip */}
      <div className="dash-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-5 border-b border-[var(--salla-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--salla-primary)_8%,var(--salla-surface)),var(--salla-surface)_55%)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium text-[var(--salla-primary)]">مرحباً بك</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              نظرة عامة على محل زينب
            </h2>
            <p className="mt-2 text-sm text-[var(--salla-muted)]" suppressHydrationWarning>
              {formatDateLong(todayIso())}
              {" · "}
              {snap.monthProfit >= 0
                ? `دخل ${snap.thisMonthLabel} يغطي المصروفات حتى اليوم`
                : `مصروفات ${snap.thisMonthLabel} أعلى من الدخل حتى اليوم`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="متاح" value={snap.availableDresses} tone="success" />
            <StatusPill label="محجوز" value={snap.reservedDresses} tone="info" />
            <StatusPill label="عند العميلة" value={snap.rentedDresses} tone="warn" />
            <StatusPill label="تنظيف" value={snap.maintenanceDresses} tone="danger" />
          </div>
        </div>
      </div>

      {/* KPI row */}
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label={`دخل ${snap.thisMonthLabel}`}
          value={formatCurrency(snap.monthIncome)}
          hint="حتى اليوم"
          icon={CircleDollarSign}
          change={snap.comparison.income.change}
          accent="success"
        />
        <Kpi
          label="المصروفات"
          value={formatCurrency(snap.monthExpenses)}
          hint="ثابت ومتغير هذا الشهر"
          icon={Wallet}
          change={snap.comparison.expenses.change}
          invert
          accent="danger"
        />
        <Kpi
          label="صافي الربح"
          value={formatSignedCurrency(snap.monthProfit)}
          hint={snap.monthProfit >= 0 ? "بعد المصروفات" : "المصروفات أعلى حالياً"}
          icon={TrendingUp}
          change={snap.comparison.profit.change}
          accent={snap.monthProfit >= 0 ? "success" : "danger"}
          emphasize={snap.monthProfit >= 0 ? "good" : "bad"}
        />
        <Kpi
          label="الحجوزات"
          value={String(snap.monthBookings)}
          hint={`${snap.yearBookings} حجز هذه السنة`}
          icon={CalendarDays}
          change={snap.comparison.bookings.change}
          accent="primary"
        />
      </dl>

      {/* Periods + inventory */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="dash-panel rounded-2xl p-5 xl:col-span-2">
          <PanelHeader
            title="الدخل عبر الفترات"
            subtitle="اليوم، الأسبوع، الشهر، والسنة"
            icon={CalendarRange}
          />
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile label="اليوم" value={formatCurrency(snap.todayIncome)} />
            <MetricTile label="هذا الأسبوع" value={formatCurrency(snap.weekIncome)} />
            <MetricTile label={`شهر ${snap.thisMonthLabel}`} value={formatCurrency(snap.monthIncome)} highlight />
            <MetricTile label="هذه السنة" value={formatCurrency(snap.yearIncome)} />
          </dl>
        </div>

        <div className="dash-panel rounded-2xl p-5">
          <PanelHeader title="مخزون الفساتين" subtitle={`${snap.totalDresses} فستان في المحل`} icon={Shirt} />
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[var(--salla-soft)]">
            <span className="bg-[var(--salla-success)]" style={{ width: `${(snap.availableDresses / dressTotal) * 100}%` }} />
            <span className="bg-sky-500" style={{ width: `${(snap.reservedDresses / dressTotal) * 100}%` }} />
            <span className="bg-amber-400" style={{ width: `${(snap.rentedDresses / dressTotal) * 100}%` }} />
            <span className="bg-[var(--salla-danger)]" style={{ width: `${(snap.maintenanceDresses / dressTotal) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <DressRow label="متاحة" value={snap.availableDresses} color="bg-[var(--salla-success)]" />
            <DressRow label="محجوزة في المحل" value={snap.reservedDresses} color="bg-sky-500" />
            <DressRow label="عند العميلات" value={snap.rentedDresses} color="bg-amber-400" />
            <DressRow label="يحتاج تنظيف" value={snap.maintenanceDresses} color="bg-[var(--salla-danger)]" />
          </ul>
        </div>
      </div>

      {/* Deposits + comparison */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dash-panel rounded-2xl p-5">
          <PanelHeader title="عربون وتأمين ومتبقي" subtitle="العربون من الإيجار، والتأمين عند المحل حتى يرجع الفستان" />
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricTile label="عربون مدفوع" value={formatCurrency(snap.depositsPaid)} />
            <MetricTile label="تأمين عند المحل" value={formatCurrency(snap.insuranceHeld)} />
            <MetricTile label="متبقي على العميلات" value={formatCurrency(snap.remainingDue)} danger />
          </dl>
        </div>
        <div className="dash-panel rounded-2xl p-5">
          <PanelHeader
            title={`مقارنة ${snap.thisMonthLabel} بـ ${snap.lastMonthLabel}`}
            subtitle="نفس عدد الأيام من أول الشهر حتى اليوم"
          />
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <CompareCard
              label="الدخل"
              current={snap.comparison.income.current}
              previous={snap.comparison.income.previous}
              change={snap.comparison.income.change}
              money
            />
            <CompareCard
              label="المصروفات"
              current={snap.comparison.expenses.current}
              previous={snap.comparison.expenses.previous}
              change={snap.comparison.expenses.change}
              money
              invert
            />
            <CompareCard
              label="صافي الربح"
              current={snap.comparison.profit.current}
              previous={snap.comparison.profit.previous}
              change={snap.comparison.profit.change}
              money
            />
            <CompareCard
              label="الحجوزات"
              current={snap.comparison.bookings.current}
              previous={snap.comparison.bookings.previous}
              change={snap.comparison.bookings.change}
            />
          </dl>
        </div>
      </div>

      {/* Chart */}
      <div className="dash-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">حركة الدخل الشهرية</h3>
            <p className="mt-1 text-xs text-[var(--salla-muted)]">
              آخر {recentMonths.length} شهر · الأعلى والأقل مميزين
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-success)_15%,transparent)] px-2.5 py-1 font-medium text-[var(--salla-success)]">
              أعلى: {history.highestIncomeMonth?.label ?? "—"}
            </span>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-danger)_15%,transparent)] px-2.5 py-1 font-medium text-[var(--salla-danger)]">
              أقل: {history.lowestIncomeMonth?.label ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex h-48 items-end gap-1.5 sm:gap-2">
          {recentMonths.map((row) => {
            const high = history.highestIncomeMonth?.key === row.key;
            const low = history.lowestIncomeMonth?.key === row.key;
            const height = Math.max(10, (row.income / maxMonthIncome) * 100);
            return (
              <div key={row.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center">
                  <div
                    title={`${row.label}: ${formatCurrency(row.income)}`}
                    className={cn(
                      "w-full max-w-9 rounded-t-md transition-all sm:max-w-11",
                      high && "bg-[var(--salla-success)]",
                      low && "bg-[var(--salla-danger)]",
                      !high && !low && "bg-[linear-gradient(180deg,var(--salla-secondary),var(--salla-primary))]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--salla-muted)]">{monthNameShortAr(`${row.key}-01`)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon?: typeof Wallet;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--salla-muted)]">{subtitle}</p>
      </div>
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--salla-muted)]" aria-hidden /> : null}
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "info" | "warn" | "danger";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
        tone === "warn" && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        tone === "danger" && "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="tabular-nums font-semibold">{value}</span>
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
  accent = "primary",
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  change: number;
  invert?: boolean;
  emphasize?: "good" | "bad";
  accent?: "success" | "danger" | "primary";
}) {
  const up = change > 0.05;
  const down = change < -0.05;
  const good = invert ? down : up;

  return (
    <div className="dash-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--salla-muted)]">{label}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]",
              emphasize === "good" && "text-[var(--salla-success)]",
              emphasize === "bad" && "text-[var(--salla-danger)]",
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent === "success" && "bg-[color-mix(in_srgb,var(--salla-success)_15%,transparent)] text-[var(--salla-success)]",
            accent === "danger" && "bg-[color-mix(in_srgb,var(--salla-danger)_15%,transparent)] text-[var(--salla-danger)]",
            accent === "primary" && "bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-[var(--salla-primary)]",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--salla-muted)]">{hint}</p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          good
            ? "bg-[color-mix(in_srgb,var(--salla-success)_12%,transparent)] text-[var(--salla-success)]"
            : down || up
              ? "bg-[color-mix(in_srgb,var(--salla-danger)_12%,transparent)] text-[var(--salla-danger)]"
              : "bg-[var(--salla-soft)] text-[var(--salla-muted)]",
        )}
      >
        {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : null}
        {down ? <ArrowDownRight className="h-3.5 w-3.5" aria-hidden /> : null}
        {comparisonLabel(change)}
      </p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/60 px-4 py-3",
        highlight && "border-[color-mix(in_srgb,var(--salla-primary)_35%,var(--salla-border))] bg-[color-mix(in_srgb,var(--salla-primary)_6%,var(--salla-surface))]",
      )}
    >
      <dt className="text-xs font-medium text-[var(--salla-muted)]">{label}</dt>
      <dd
        className={cn(
          "mt-1.5 text-lg font-semibold tabular-nums text-[var(--foreground)]",
          danger && "text-[var(--salla-danger)]",
          highlight && "text-[var(--salla-primary)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
        <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
        {label}
      </span>
      <span className="tabular-nums font-semibold text-[var(--foreground)]">{value}</span>
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
    <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3.5 py-3">
      <dt className="text-xs font-medium text-[var(--salla-muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">{format(current)}</dd>
      <p className="mt-1 text-[11px] text-[var(--salla-muted)]">الشهر الماضي {format(previous)}</p>
      <p
        className={cn(
          "mt-1.5 text-xs font-medium",
          good ? "text-[var(--salla-success)]" : down || up ? "text-[var(--salla-danger)]" : "text-[var(--salla-muted)]",
        )}
      >
        {comparisonLabel(change)}
      </p>
    </div>
  );
}
