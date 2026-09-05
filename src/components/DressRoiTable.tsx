"use client";

import { BadgeCheck } from "lucide-react";
import { DressVariants } from "@/components/DressVariants";
import { useShop } from "@/context/ShopContext";
import {
  capitalRecoveryPercent,
  dressDirectExpenses,
  dressNetProfit,
  dressRentalRevenue,
  hasBrokenEven,
} from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/format";

export function DressRoiTable() {
  const { dresses, bookings, variableExpenses } = useShop();

  return (
    <section>
      <div className="mb-5">
        <p className="text-sm text-rose-400">كل فستان لحاله</p>
        <h3 className="mt-1 text-2xl font-medium text-rose-900 sm:text-3xl">هل رجّع سعره؟</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
          سعر الشراء رأس مال. الربح يظهر بعد ما يغطي التأجير سعر الفستان والتنظيف والإصلاح.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dresses.map((dress) => {
          const revenue = dressRentalRevenue(dress.id, bookings);
          const direct = dressDirectExpenses(dress.id, variableExpenses);
          const net = dressNetProfit(dress, bookings, variableExpenses);
          const recovered = capitalRecoveryPercent(dress, bookings, variableExpenses);
          const brokenEven = hasBrokenEven(dress, bookings, variableExpenses);
          const barWidth = Math.max(0, Math.min(100, recovered));
          return (
            <article key={dress.id} className="shop-card rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg text-rose-900">{dress.name}</h4>
                  {brokenEven ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                      رجّع سعره وصار يربح
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-rose-300">لسه ما رجّع سعر الشراء</p>
                  )}
                </div>
                <p className={cn("text-lg tabular-nums", net >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {net >= 0 ? formatCurrency(net) : `−${formatCurrency(Math.abs(net))}`}
                </p>
              </div>
              <div className="mt-3">
                <DressVariants dress={dress} dresses={dresses} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl bg-rose-50 px-3 py-2">
                  <dt className="text-[11px] text-rose-400">اشتريناه</dt>
                  <dd className="mt-0.5 tabular-nums text-rose-900">{formatCurrency(dress.purchasePrice)}</dd>
                </div>
                <div className="rounded-2xl bg-amber-50 px-3 py-2">
                  <dt className="text-[11px] text-amber-600">دخل منه</dt>
                  <dd className="mt-0.5 tabular-nums text-amber-900">{formatCurrency(revenue)}</dd>
                </div>
                <div className="rounded-2xl bg-violet-50 px-3 py-2">
                  <dt className="text-[11px] text-violet-400">تنظيف وإصلاح</dt>
                  <dd className="mt-0.5 tabular-nums text-violet-900">{formatCurrency(direct)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px] text-rose-400">
                  <span>{brokenEven ? "رجع رأس المال" : "كم رجّع من سعره"}</span>
                  <span className="tabular-nums">{Math.round(barWidth)}٪</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-rose-50">
                  <div
                    className={cn("h-full rounded-full", brokenEven ? "bg-emerald-400" : "bg-amber-300")}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
