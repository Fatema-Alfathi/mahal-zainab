"use client";

import { useMemo, useState } from "react";
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

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm text-rose-400">تحليل زمني</p>
        <h2 className="mt-1 font-serif text-3xl text-rose-900">الأشهر والسنوات</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
          أعلى وأقل دخل، وكل شهر وكل سنة بأرقامها: الدخل، المصروفات، الربح، والحجوزات.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Highlight label="أعلى شهر دخل" row={history.highestIncomeMonth} field="income" tone="mint" />
        <Highlight label="أقل شهر دخل" row={history.lowestIncomeMonth} field="income" tone="gold" />
        <Highlight label="أضعف شهر فيه حجوزات" row={history.weakestBusyMonth} field="income" tone="gold" />
        <Highlight label="أكثر شهر حجوزات" row={history.mostBookingsMonth} field="bookings" tone="rose" />
        <Highlight label="أعلى شهر ربح" row={history.highestProfitMonth} field="profit" tone="mint" />
        <Highlight label="أقل شهر ربح" row={history.lowestProfitMonth} field="profit" tone="gold" />
        <Highlight label="أعلى سنة دخل" row={history.highestIncomeYear} field="income" tone="rose" />
        <Highlight label="أقل سنة دخل" row={history.lowestIncomeYear} field="income" tone="gold" />
      </dl>

      <div className="dash-panel rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl text-rose-900">دخل كل شهر</h3>
            <p className="mt-1 text-sm text-rose-400">اختاري السنة. العمود الأخضر أعلى دخل، والذهبي أقل دخل.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="اختيار السنة">
            {years.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setYear(item)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm",
                  year === item ? "shop-btn" : "bg-rose-50 text-rose-500 hover:bg-rose-100",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
          {months.map((row) => {
            const high = history.highestIncomeMonth?.key === row.key;
            const low = history.lowestIncomeMonth?.key === row.key;
            const height = Math.max(10, (row.income / maxIncome) * 100);
            return (
              <div key={row.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <p className="text-[10px] tabular-nums text-rose-400">{row.income === 0 ? "—" : Math.round(row.income)}</p>
                <div className="flex h-36 w-full items-end justify-center">
                  <div
                    title={`${row.label}: ${formatCurrency(row.income)}`}
                    className={cn(
                      "w-full max-w-12 rounded-t-xl",
                      high ? "bg-emerald-400" : low ? "bg-amber-300" : "bg-gradient-to-t from-[#2d0503] to-[#ebd8bb]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[11px] text-rose-500">{monthNameShortAr(`${row.key}-01`)}</span>
              </div>
            );
          })}
        </div>

        <ul className="mt-6 divide-y divide-rose-50">
          {months.map((row) => {
            const high = history.highestIncomeMonth?.key === row.key;
            const low = history.lowestIncomeMonth?.key === row.key;
            return (
              <li key={row.key} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-rose-800">
                  {row.label}
                  {high ? <span className="mr-2 text-xs text-emerald-600">أعلى دخل</span> : null}
                  {low ? <span className="mr-2 text-xs text-amber-700">أقل دخل</span> : null}
                </span>
                <span className="text-rose-400">
                  دخل <span className="tabular-nums text-rose-900">{formatCurrency(row.income)}</span>
                  {" · "}
                  ربح <span className="tabular-nums">{formatSignedCurrency(row.profit)}</span>
                  {" · "}
                  {row.bookings} حجز
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="dash-panel rounded-3xl p-5 sm:p-6">
        <h3 className="text-xl text-rose-900">كل السنوات</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="text-right text-rose-400">
                <th className="pb-3 font-medium">السنة</th>
                <th className="pb-3 font-medium">الدخل</th>
                <th className="pb-3 font-medium">المصروفات</th>
                <th className="pb-3 font-medium">صافي الربح</th>
                <th className="pb-3 font-medium">الحجوزات</th>
              </tr>
            </thead>
            <tbody>
              {history.years.map((row) => {
                const top = history.highestIncomeYear?.key === row.key;
                const bottom = history.lowestIncomeYear?.key === row.key && history.years.length > 1;
                return (
                  <tr key={row.key} className="border-t border-rose-50">
                    <td className="py-3.5 text-rose-900">
                      {row.label}
                      {top ? <span className="mr-2 text-xs text-emerald-600">الأعلى</span> : null}
                      {bottom ? <span className="mr-2 text-xs text-amber-700">الأقل</span> : null}
                    </td>
                    <td className="py-3.5 tabular-nums text-rose-900">{formatCurrency(row.income)}</td>
                    <td className="py-3.5 tabular-nums text-rose-700">{formatCurrency(row.expenses)}</td>
                    <td className={cn("py-3.5 tabular-nums", row.profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {formatSignedCurrency(row.profit)}
                    </td>
                    <td className="py-3.5 tabular-nums text-rose-900">{row.bookings}</td>
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
  tone,
}: {
  label: string;
  row: HistoryRow | null;
  field: "income" | "profit" | "bookings";
  tone: "rose" | "gold" | "mint";
}) {
  const value = row ? row[field] : 0;
  return (
    <div
      className={cn(
        "rounded-3xl px-4 py-4 ring-1 ring-inset",
        tone === "rose" && "bg-white ring-rose-100",
        tone === "gold" && "bg-amber-50/80 ring-amber-100",
        tone === "mint" && "bg-emerald-50/80 ring-emerald-100",
      )}
    >
      <p className="text-xs text-rose-400">{label}</p>
      <p className="mt-1 text-lg text-rose-900">{row?.label ?? "—"}</p>
      <p className="mt-1 text-xl tabular-nums text-rose-900">
        {field === "bookings" ? `${value} حجز` : formatSignedCurrency(value)}
      </p>
    </div>
  );
}
