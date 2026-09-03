"use client";

import { BadgeCheck, Gem } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import {
  capitalRecoveryPercent,
  dressDirectExpenses,
  dressNetProfit,
  dressRentalRevenue,
  dressRoiPercent,
  hasBrokenEven,
} from "@/lib/finance";
import { cn, formatCurrency, formatPercent } from "@/lib/format";

export function DressRoiTable() {
  const { dresses, bookings, variableExpenses } = useShop();

  return (
    <section className="rounded-3xl bg-white/80 p-6">
      <div className="mb-5">
        <p className="text-sm text-stone-400">أداء الفساتين</p>
        <h3 className="mt-1 text-2xl font-medium text-stone-800">عائد الاستثمار</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-500">
          صافي ربح الفستان = إيراد التأجير − سعر الشراء − التنظيف الجاف والإصلاحات.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-start text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs text-stone-500">
              <th className="pb-2 font-medium">الفستان</th>
              <th className="pb-2 text-end font-medium">سعر الشراء</th>
              <th className="pb-2 text-end font-medium">إيراد التأجير</th>
              <th className="pb-2 text-end font-medium">المصروفات المباشرة</th>
              <th className="pb-2 text-end font-medium">صافي ربح الفستان</th>
              <th className="pb-2 text-end font-medium">العائد</th>
              <th className="pb-2 font-medium">استرداد رأس المال</th>
            </tr>
          </thead>
          <tbody>
            {dresses.map((dress) => {
              const revenue = dressRentalRevenue(dress.id, bookings);
              const direct = dressDirectExpenses(dress.id, variableExpenses);
              const net = dressNetProfit(dress, bookings, variableExpenses);
              const roi = dressRoiPercent(dress, bookings, variableExpenses);
              const recovered = capitalRecoveryPercent(dress, bookings, variableExpenses);
              const brokenEven = hasBrokenEven(dress, bookings, variableExpenses);
              const barWidth = Math.max(0, Math.min(100, recovered));
              return (
                <tr key={dress.id} className="border-b border-stone-100 align-top last:border-0">
                  <td className="py-4">
                    <div className="flex items-start gap-2">
                      <Gem className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden />
                      <div>
                        <p className="font-medium text-stone-800">{dress.name}</p>
                        {brokenEven ? (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-teal-800">
                            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                            وصل لنقطة التعادل
                          </span>
                        ) : (
                          <span className="mt-1 inline-block text-xs text-stone-400">ما زال يسترد رأس المال</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-end tabular-nums text-stone-700">{formatCurrency(dress.purchasePrice)}</td>
                  <td className="py-4 text-end tabular-nums text-stone-700">{formatCurrency(revenue)}</td>
                  <td className="py-4 text-end tabular-nums text-stone-700">{formatCurrency(direct)}</td>
                  <td className={cn("py-4 text-end tabular-nums", net >= 0 ? "text-teal-800" : "text-rose-700")}>
                    {formatCurrency(net)}
                  </td>
                  <td className={cn("py-4 text-end tabular-nums", roi >= 0 ? "text-teal-800" : "text-rose-700")}>
                    {formatPercent(roi)}
                  </td>
                  <td className="py-4">
                    <div className="min-w-[140px]">
                      <div className="mb-1 flex justify-between text-[11px] text-stone-500">
                        <span>{brokenEven ? "ربح صافٍ" : "نحو نقطة التعادل"}</span>
                        <span className="tabular-nums">{Math.round(barWidth)}٪</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#f3f1ee]">
                        <div
                          className={cn("h-full rounded-full", brokenEven ? "bg-teal-700/80" : "bg-stone-300")}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
