"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { calculateBookingRevenue, rentalDayCount } from "@/lib/finance";
import { formatCurrency, todayIso } from "@/lib/format";
import { daysLabel } from "@/lib/labels";
import type { Dress } from "@/types";

export function BookingModal({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  const { isOwner, createBooking } = useShop();
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [error, setError] = useState("");
  const days = useMemo(() => rentalDayCount(startDate, endDate), [startDate, endDate]);
  const total = useMemo(
    () => calculateBookingRevenue(dress.rentalPricePerDay, startDate, endDate),
    [dress.rentalPricePerDay, startDate, endDate],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!customerName.trim()) {
      setError("اسم الزبونة مطلوب.");
      return;
    }
    if (endDate < startDate) {
      setError("تاريخ الانتهاء يجب أن يكون في يوم البداية أو بعده.");
      return;
    }
    createBooking({
      dressId: dress.id,
      customerName: customerName.trim(),
      startDate,
      endDate,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق نافذة الحجز" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-stone-400">حجز جديد</p>
            <h3 id="booking-title" className="mt-1 text-2xl text-stone-800">
              حجز {dress.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-stone-600">اسم الزبونة</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800"
              placeholder="مثال: عائشة رحمن"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-stone-600">تاريخ البداية</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-stone-600">تاريخ الانتهاء</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800"
              />
            </label>
          </div>
          {isOwner ? (
            <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
              <div className="flex items-center gap-2 font-medium">
                <CalendarRange className="h-4 w-4" aria-hidden />
                {daysLabel(days)} × {formatCurrency(dress.rentalPricePerDay)}
              </div>
              <p className="mt-1 text-2xl tabular-nums">{formatCurrency(total)}</p>
              <p className="text-xs text-teal-800/80">يُضاف إلى الإيراد الإجمالي عند التأكيد.</p>
            </div>
          ) : (
            <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              تم حجز {daysLabel(days)}. يُحتسب السعر تلقائياً في دفتر المالك.
            </p>
          )}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" className="w-full rounded-2xl bg-stone-800 py-2.5 text-sm text-white hover:bg-stone-700">
            تأكيد الحجز
          </button>
        </form>
      </div>
    </div>
  );
}
