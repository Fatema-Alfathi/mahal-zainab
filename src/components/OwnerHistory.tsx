"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ownerHistory, type HistoryRow } from "@/lib/ownerSnapshot";
import { cn, formatCurrency, formatSignedCurrency, monthNameShortAr } from "@/lib/format";

export function OwnerHistory() {
  const { bookings, fixedExpenses, variableExpenses } = useShop();
  const history = useMemo(
    () => ownerHistory(bookings, fixedExpenses, variableExpenses),
    [bookings, fixedExpenses, variableExpenses],
  );
  const years = history.years.map((row) => row.key);
  const [year, setYear] = useState(years[years.length - 1] ?? "");
  const months = history.months.filter((row) => row.key.startsWith(year));
  const maxIncome = Math.max(...months.map((row) => row.income), 1);
  const yearIncomeHigh = Math.max(...months.map((row) => row.income), 0);
  const yearIncomeLow = Math.min(...months.map((row) => row.income), 0);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--salla-primary)]">تحليل زمني</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          الأشهر والسنوات
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
          أعلى وأقل دخل، وكل شهر وكل سنة بأرقامها: الدخل، المصروفات، الربح، والحجوزات.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Highlight
          label="أعلى شهر دخل"
          row={history.highestIncomeMonth}
          field="income"
          accent="success"
          icon={TrendingUp}
        />
        <Highlight
          label="أقل شهر دخل"
          row={history.lowestIncomeMonth}
          field="income"
          accent="danger"
          icon={TrendingDown}
        />
        <Highlight
          label="أضعف شهر نشط"
          row={history.weakestBusyMonth}
          field="income"
          accent="warn"
          icon={ArrowDownRight}
        />
        <Highlight
          label="أكثر شهر حجوزات"
          row={history.mostBookingsMonth}
          field="bookings"
          accent="info"
          icon={ArrowUpRight}
        />
        <Highlight
          label="أعلى شهر ربح"
          row={history.highestProfitMonth}
          field="profit"
          accent="success"
          icon={TrendingUp}
        />
        <Highlight
          label="أقل شهر ربح"
          row={history.lowestProfitMonth}
          field="profit"
          accent="danger"
          icon={TrendingDown}
        />
        <Highlight
          label="أعلى سنة دخل"
          row={history.highestIncomeYear}
          field="income"
          accent="success"
          icon={CalendarRange}
        />
        <Highlight
          label="أقل سنة دخل"
          row={history.lowestIncomeYear}
          field="income"
          accent="danger"
          icon={CalendarRange}
        />
      </dl>

      <div className="dash-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">دخل كل شهر</h3>
            <p className="mt-1 text-xs text-[var(--salla-muted)]">
              اختاري السنة. الأخضر أعلى دخل، والأحمر أقل دخل في نفس السنة.
            </p>
          </div>
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/60 p-1" role="group" aria-label="اختيار السنة">
            {years.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setYear(item)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  year === item
                    ? "bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#1d1e20]"
                    : "text-[var(--salla-muted)] hover:bg-[var(--salla-surface)] hover:text-[var(--foreground)]",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex h-56 items-end gap-1.5 sm:gap-2.5">
          {months.map((row) => {
            const high = row.income > 0 && row.income === yearIncomeHigh;
            const low =
              months.some((item) => item.income > 0) &&
              row.income === yearIncomeLow &&
              row.income !== yearIncomeHigh;
            const height = row.income <= 0 ? 4 : Math.max(12, (row.income / maxIncome) * 100);
            return (
              <div key={row.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <p className="text-[10px] tabular-nums text-[var(--salla-muted)]">
                  {row.income === 0 ? "—" : Math.round(row.income)}
                </p>
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    title={`${row.label}: ${formatCurrency(row.income)}`}
                    className={cn(
                      "w-full max-w-11 rounded-t-md transition-all",
                      high && "bg-[var(--salla-success)]",
                      low && "bg-[var(--salla-danger)]",
                      !high && !low && row.income > 0 && "bg-[linear-gradient(180deg,var(--salla-secondary),var(--salla-primary))]",
                      row.income <= 0 && "bg-[var(--salla-border)]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--salla-muted)]">{monthNameShortAr(`${row.key}-01`)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--salla-border)]">
          <ul className="divide-y divide-[var(--salla-border)]">
            {months.map((row) => {
              const high = row.income > 0 && row.income === yearIncomeHigh;
              const low =
                months.some((item) => item.income > 0) &&
                row.income === yearIncomeLow &&
                row.income !== yearIncomeHigh;
              return (
                <li
                  key={row.key}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-[var(--salla-soft)]/50"
                >
                  <span className="inline-flex flex-wrap items-center gap-2 font-medium text-[var(--foreground)]">
                    {row.label}
                    {high ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--salla-success)]">
                        أعلى دخل
                      </span>
                    ) : null}
                    {low ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--salla-danger)]">
                        أقل دخل
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-[var(--salla-muted)] sm:text-sm">
                    دخل{" "}
                    <span className="font-semibold tabular-nums text-[var(--salla-primary)]">
                      {formatCurrency(row.income)}
                    </span>
                    {" · "}
                    ربح{" "}
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        row.profit >= 0 ? "text-[var(--salla-success)]" : "text-[var(--salla-danger)]",
                      )}
                    >
                      {formatSignedCurrency(row.profit)}
                    </span>
                    {" · "}
                    <span className="tabular-nums text-[var(--foreground)]">{row.bookings} حجز</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="dash-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--foreground)]">كل السنوات</h3>
          <p className="mt-1 text-xs text-[var(--salla-muted)]">مقارنة الدخل والمصروفات والربح عبر السنوات</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[var(--salla-border)]">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="bg-[var(--salla-soft)]/80 text-right text-xs text-[var(--salla-muted)]">
                <th className="px-4 py-3 font-medium">السنة</th>
                <th className="px-4 py-3 font-medium">الدخل</th>
                <th className="px-4 py-3 font-medium">المصروفات</th>
                <th className="px-4 py-3 font-medium">صافي الربح</th>
                <th className="px-4 py-3 font-medium">الحجوزات</th>
              </tr>
            </thead>
            <tbody>
              {history.years.map((row) => {
                const top = history.highestIncomeYear?.key === row.key;
                const bottom = history.lowestIncomeYear?.key === row.key && history.years.length > 1;
                return (
                  <tr
                    key={row.key}
                    className="border-t border-[var(--salla-border)] transition hover:bg-[var(--salla-soft)]/40"
                  >
                    <td className="px-4 py-3.5 font-medium text-[var(--foreground)]">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        {row.label}
                        {top ? (
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--salla-success)]">
                            الأعلى
                          </span>
                        ) : null}
                        {bottom ? (
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--salla-danger)]">
                            الأقل
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-[var(--salla-primary)]">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--foreground)]">
                      {formatCurrency(row.expenses)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 tabular-nums font-semibold",
                        row.profit >= 0 ? "text-[var(--salla-success)]" : "text-[var(--salla-danger)]",
                      )}
                    >
                      {formatSignedCurrency(row.profit)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--foreground)]">{row.bookings}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Highlight({
  label,
  row,
  field,
  accent,
  icon: Icon,
}: {
  label: string;
  row: HistoryRow | null;
  field: "income" | "profit" | "bookings";
  accent: "success" | "danger" | "warn" | "info";
  icon: typeof TrendingUp;
}) {
  const value = row ? row[field] : 0;
  return (
    <div className="dash-panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--salla-muted)]">{label}</p>
          <p className="mt-1.5 truncate text-base font-semibold text-[var(--foreground)]">{row?.label ?? "—"}</p>
          <p
            className={cn(
              "mt-2 text-xl font-semibold tabular-nums tracking-tight",
              accent === "success" && "text-[var(--salla-success)]",
              accent === "danger" && "text-[var(--salla-danger)]",
              accent === "warn" && "text-amber-600",
              accent === "info" && "text-sky-600",
            )}
          >
            {field === "bookings" ? `${value} حجز` : formatSignedCurrency(value)}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            accent === "success" && "bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] text-[var(--salla-success)]",
            accent === "danger" && "bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] text-[var(--salla-danger)]",
            accent === "warn" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
            accent === "info" && "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </div>
  );
}
