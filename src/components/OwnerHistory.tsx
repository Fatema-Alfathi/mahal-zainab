"use client";

import { useMemo, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { ownerHistory, type HistoryRow } from "@/lib/ownerSnapshot";
import { cn, formatCurrency } from "@/lib/format";

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
    <section className="space-y-6">
      <div>
        <p className="text-sm text-rose-400">مقارنة الزمن</p>
        <h2 className="mt-1 text-3xl font-medium text-rose-900">الأشهر والسنوات</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
          كل شهر وكل سنة لحاله: الدخل، المصروفات، الربح، وعدد الحجوزات. وأعلى وأقل شهر يبينون من أول رقم.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Highlight
          label="أعلى شهر دخل"
          row={history.highestIncomeMonth}
          field="income"
          tint="mint"
        />
        <Highlight
          label="أقل شهر دخل"
          row={history.lowestIncomeMonth}
          field="income"
          tint="gold"
        />
        <Highlight
          label="أضعف شهر فيه حجوزات"
          row={history.weakestBusyMonth}
          field="income"
          tint="gold"
        />
        <Highlight
          label="أكثر شهر حجوزات"
          row={history.mostBookingsMonth}
          field="bookings"
          tint="rose"
        />
        <Highlight
          label="أعلى شهر ربح"
          row={history.highestProfitMonth}
          field="profit"
          tint="mint"
        />
        <Highlight
          label="أقل شهر ربح"
          row={history.lowestProfitMonth}
          field="profit"
          tint="gold"
        />
        <Highlight
          label="أعلى سنة دخل"
          row={history.highestIncomeYear}
          field="income"
          tint="rose"
        />
      </dl>

      <div className="shop-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl text-rose-900">دخل كل شهر</h3>
            <p className="mt-1 text-sm text-rose-400">اختاري السنة عشان تشوفين شهورها كلها.</p>
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
        <ul className="mt-5 space-y-3">
          {months.map((row) => {
            const high = history.highestIncomeMonth?.key === row.key;
            const low = history.lowestIncomeMonth?.key === row.key;
            return (
              <li key={row.key}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-rose-800">
                    {row.label}
                    {high ? <span className="mr-2 text-xs text-emerald-600">أعلى دخل</span> : null}
                    {low ? <span className="mr-2 text-xs text-amber-700">أقل دخل</span> : null}
                  </span>
                  <span className="tabular-nums text-rose-900">{formatCurrency(row.income)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-rose-50">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      high ? "bg-emerald-400" : low ? "bg-amber-300" : "bg-rose-300",
                    )}
                    style={{ width: `${Math.max(3, (row.income / maxIncome) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-rose-400">
                  مصروفات {money(row.expenses)} · ربح {money(row.profit)} · حجوزات {row.bookings}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="shop-card rounded-3xl p-5 sm:p-6">
        <h3 className="text-xl text-rose-900">كل السنوات</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="text-right text-rose-400">
                <th className="pb-2 font-medium">السنة</th>
                <th className="pb-2 font-medium">الدخل</th>
                <th className="pb-2 font-medium">المصروفات</th>
                <th className="pb-2 font-medium">صافي الربح</th>
                <th className="pb-2 font-medium">الحجوزات</th>
              </tr>
            </thead>
            <tbody>
              {history.years.map((row) => {
                const top = history.highestIncomeYear?.key === row.key;
                const bottom = history.lowestIncomeYear?.key === row.key && history.years.length > 1;
                return (
                  <tr key={row.key} className="border-t border-rose-50">
                    <td className="py-3 text-rose-900">
                      {row.label}
                      {top ? <span className="mr-2 text-xs text-emerald-600">الأعلى</span> : null}
                      {bottom ? <span className="mr-2 text-xs text-amber-700">الأقل</span> : null}
                    </td>
                    <td className="py-3 tabular-nums text-rose-900">{formatCurrency(row.income)}</td>
                    <td className="py-3 tabular-nums text-rose-700">{formatCurrency(row.expenses)}</td>
                    <td className={cn("py-3 tabular-nums", row.profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {money(row.profit)}
                    </td>
                    <td className="py-3 tabular-nums text-rose-900">{row.bookings}</td>
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

function money(value: number): string {
  return value < 0 ? `−${formatCurrency(Math.abs(value))}` : formatCurrency(value);
}

function Highlight({
  label,
  row,
  field,
  tint,
}: {
  label: string;
  row: HistoryRow | null;
  field: "income" | "profit" | "bookings";
  tint: "rose" | "gold" | "mint";
}) {
  const value = row ? row[field] : 0;
  return (
    <div
      className={cn(
        "rounded-3xl px-4 py-4",
        tint === "rose" && "bg-rose-50",
        tint === "gold" && "bg-amber-50",
        tint === "mint" && "bg-emerald-50",
      )}
    >
      <p className="text-xs text-rose-400">{label}</p>
      <p className="mt-1 text-lg text-rose-900">{row?.label ?? "—"}</p>
      <p className="mt-1 text-xl tabular-nums text-rose-900">
        {field === "bookings" ? `${value} حجز` : money(value)}
      </p>
    </div>
  );
}
