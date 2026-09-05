"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { useShop } from "@/context/ShopContext";
import { DressVariants } from "@/components/DressVariants";
import { categoryLabel, dressDisplay, measurementLine, sizeLabel } from "@/lib/dressCatalog";
import { applyBookingDiscount, calculateBookingSubtotal, rentalDayCount } from "@/lib/finance";
import { formatCurrency, todayIso } from "@/lib/format";
import { DISCOUNT_TYPE_LABELS, authorizedDiscountLabel, daysLabel, discountLabel } from "@/lib/labels";
import type { DiscountType, Dress } from "@/types";

const PERCENT_PRESETS = [5, 10, 15, 20];

export function BookingModal({
  dress,
  onClose,
  onSwitchDress,
}: {
  dress: Dress;
  onClose: () => void;
  onSwitchDress?: (dress: Dress) => void;
}) {
  const { dresses, isOwner, createBooking, discountPolicy } = useShop();
  const presentation = dressDisplay(dress);
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("");
  const [applyOwnerDiscount, setApplyOwnerDiscount] = useState(false);
  const [error, setError] = useState("");
  const days = useMemo(() => rentalDayCount(startDate, endDate), [startDate, endDate]);
  const employeeCanDiscount = !isOwner && discountPolicy.enabled && discountPolicy.value > 0;
  const effectiveType: DiscountType = isOwner
    ? discountType
    : applyOwnerDiscount && employeeCanDiscount
      ? discountPolicy.type
      : "none";
  const effectiveValue = isOwner
    ? Number(discountValue)
    : applyOwnerDiscount && employeeCanDiscount
      ? discountPolicy.value
      : 0;
  const quote = useMemo(() => {
    const subtotal = calculateBookingSubtotal(dress.rentalPricePerDay, startDate, endDate);
    const appliedValue =
      effectiveType === "none" || !Number.isFinite(effectiveValue) ? 0 : effectiveValue;
    return {
      subtotal,
      ...applyBookingDiscount(subtotal, effectiveType, appliedValue),
    };
  }, [dress.rentalPricePerDay, effectiveType, effectiveValue, endDate, startDate]);

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
    if (isOwner && discountType !== "none") {
      const parsedDiscount = Number(discountValue);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
        setError("أدخل قيمة خصم أكبر من صفر، أو اختر بدون خصم.");
        return;
      }
      if (discountType === "percent" && parsedDiscount > 100) {
        setError("نسبة الخصم لا تتجاوز 100٪.");
        return;
      }
      if (discountType === "amount" && parsedDiscount > quote.subtotal) {
        setError("مبلغ الخصم أكبر من إجمالي الحجز.");
        return;
      }
    }
    createBooking({
      dressId: dress.id,
      customerName: customerName.trim(),
      startDate,
      endDate,
      discountType: effectiveType,
      discountValue: effectiveType === "none" ? 0 : effectiveValue,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق نافذة الحجز" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="shop-card relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-rose-400">
              حجز جديد · {categoryLabel(dress.category)} · {dress.color} · {sizeLabel(dress.size)}
            </p>
            <h3 id="booking-title" className="mt-1 text-2xl text-rose-900">
              حجز {dress.name}
            </h3>
            {measurementLine(dress.measurements) ? (
              <p className="mt-1 text-xs leading-6 text-rose-400">{measurementLine(dress.measurements)}</p>
            ) : null}
            <div className="mt-2">
              <DressVariants
                dress={dress}
                dresses={dresses}
                onSelect={
                  onSwitchDress
                    ? (item) => {
                        if (item.status === "available") onSwitchDress(item);
                      }
                    : undefined
                }
              />
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-4 overflow-hidden rounded-2xl">
          <DressGallery
            images={presentation.images}
            alt={dress.name}
            fallbackClassName={presentation.palette}
            heightClass="h-40"
          />
          <div className="shop-soft px-3 py-3">
            <DressBarcode value={dress.barcode} height={40} moduleWidth={1.05} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">اسم الزبونة</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              placeholder="مثال: عائشة رحمن"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">تاريخ البداية</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">تاريخ الانتهاء</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              />
            </label>
          </div>
          {isOwner ? (
            <OwnerDiscountFields
              discountType={discountType}
              discountValue={discountValue}
              onTypeChange={(type) => {
                setDiscountType(type);
                setDiscountValue(type === "none" ? "" : discountValue);
                setError("");
              }}
              onValueChange={setDiscountValue}
            />
          ) : employeeCanDiscount ? (
            <label className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <input
                type="checkbox"
                checked={applyOwnerDiscount}
                onChange={(event) => setApplyOwnerDiscount(event.target.checked)}
                className="mt-1 h-4 w-4 accent-rose-500"
              />
              <span>
                <span className="block font-medium">تطبيق خصم المالك</span>
                <span className="mt-1 block text-rose-400">
                  {authorizedDiscountLabel(discountPolicy.type, discountPolicy.value)}. القيمة ثابتة بقرار المالك ولا يمكن تغييرها.
                </span>
              </span>
            </label>
          ) : (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              الخصم مغلق حالياً. الموظفات يطبقنه فقط إذا سمح المالك وحدّد قيمته.
            </p>
          )}
          {isOwner ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-medium">
                <CalendarRange className="h-4 w-4" aria-hidden />
                {daysLabel(days)} × {formatCurrency(dress.rentalPricePerDay)}
              </div>
              <dl className="mt-2 space-y-1 text-xs text-emerald-800/90">
                <div className="flex justify-between gap-3">
                  <dt>قبل الخصم</dt>
                  <dd className="tabular-nums">{formatCurrency(quote.subtotal)}</dd>
                </div>
                {quote.discountAmount > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt>{discountLabel(effectiveType, Number.isFinite(effectiveValue) ? effectiveValue : 0)}</dt>
                    <dd className="tabular-nums">− {formatCurrency(quote.discountAmount)}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-2 text-2xl tabular-nums">{formatCurrency(quote.total)}</p>
              <p className="text-xs text-emerald-700/80">يُضاف الصافي إلى الإيراد الإجمالي عند التأكيد.</p>
            </div>
          ) : (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              تم حجز {daysLabel(days)}
              {effectiveType !== "none"
                ? ` مع ${authorizedDiscountLabel(discountPolicy.type, discountPolicy.value)}`
                : ""}
              . يُحتسب السعر تلقائياً في دفتر المالك.
            </p>
          )}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" className="shop-btn w-full rounded-2xl py-2.5 text-sm">
            تأكيد الحجز
          </button>
        </form>
      </div>
    </div>
  );
}

function OwnerDiscountFields({
  discountType,
  discountValue,
  onTypeChange,
  onValueChange,
}: {
  discountType: DiscountType;
  discountValue: string;
  onTypeChange: (type: DiscountType) => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm text-rose-700">خصم هذا الحجز</legend>
      <div className="grid grid-cols-3 gap-2">
        {(["none", "percent", "amount"] as DiscountType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className={
              discountType === type
                ? "shop-btn rounded-xl px-2 py-2 text-xs"
                : "rounded-xl bg-rose-50 px-2 py-2 text-xs text-rose-500 hover:bg-rose-100"
            }
          >
            {DISCOUNT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      {discountType === "percent" ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {PERCENT_PRESETS.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => onValueChange(String(percent))}
                className={
                  discountValue === String(percent)
                    ? "shop-btn rounded-full px-2.5 py-1 text-xs"
                    : "rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-100"
                }
              >
                {percent}٪
              </button>
            ))}
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">نسبة الخصم</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountValue}
              onChange={(event) => onValueChange(event.target.value)}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              placeholder="10"
            />
          </label>
        </div>
      ) : null}
      {discountType === "amount" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-rose-700">مبلغ الخصم بالريال العماني</span>
          <input
            type="number"
            min="0"
            step="0.001"
            value={discountValue}
            onChange={(event) => onValueChange(event.target.value)}
            className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
            placeholder="5"
          />
        </label>
      ) : null}
    </fieldset>
  );
}
