"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { useShop } from "@/context/ShopContext";
import { DressVariants } from "@/components/DressVariants";
import { categoryLabel, dressDisplay, measurementLine, sizeLabel } from "@/lib/dressCatalog";
import { fittingDateForPickup } from "@/lib/customers";
import { applyBookingDiscount, calculateBookingSubtotal, rentalDayCount } from "@/lib/finance";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
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
  const { dresses, customers, isOwner, createBooking, discountPolicy } = useShop();
  const presentation = dressDisplay(dress);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [needsAlterations, setNeedsAlterations] = useState(false);
  const [needsFitting, setNeedsFitting] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("");
  const [applyOwnerDiscount, setApplyOwnerDiscount] = useState(false);
  const [depositPaid, setDepositPaid] = useState("");
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
      setError("اسم العميلة مطلوب.");
      return;
    }
    if (!phone.trim()) {
      setError("رقم هاتف العميلة مطلوب.");
      return;
    }
    if (endDate < startDate) {
      setError("تاريخ الانتهاء يجب أن يكون في يوم البداية أو بعده.");
      return;
    }
    const parsedDeposit = depositPaid.trim() === "" ? 0 : Number(depositPaid);
    if (!Number.isFinite(parsedDeposit) || parsedDeposit < 0) {
      setError("أدخلي عربون صفر أو أكثر.");
      return;
    }
    if (parsedDeposit > quote.total) {
      setError("العربون أكبر من إجمالي الحجز.");
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
      customerId: customerId || undefined,
      customerName: customerName.trim(),
      phone: phone.trim(),
      eventDate,
      startDate,
      endDate,
      discountType: effectiveType,
      discountValue: effectiveType === "none" ? 0 : effectiveValue,
      depositPaid: parsedDeposit,
      needsAlterations,
      needsFitting,
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
            <span className="mb-1 block text-rose-700">عميلة موجودة؟</span>
            <select
              value={customerId}
              onChange={(event) => {
                const id = event.target.value;
                setCustomerId(id);
                const customer = customers.find((item) => item.id === id);
                if (!customer) return;
                setCustomerName(customer.name);
                setPhone(customer.phone);
                setEventDate(customer.eventDate);
              }}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
            >
              <option value="">عميلة جديدة</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.number} · {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">اسم العميلة</span>
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
              <span className="mb-1 block text-rose-700">رقم الهاتف</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
                placeholder="9xxxxxxx"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">تاريخ المناسبة</span>
              <input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">موعد الاستلام</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">موعد الإرجاع</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              />
            </label>
          </div>
          <label className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <input
              type="checkbox"
              checked={needsAlterations}
              onChange={(event) => {
                setNeedsAlterations(event.target.checked);
                if (event.target.checked) setNeedsFitting(true);
              }}
              className="mt-1 h-4 w-4 accent-rose-500"
            />
            <span>
              <span className="block font-medium">يحتاج تعديلات</span>
              <span className="mt-1 block text-rose-400">إذا يحتاج تعديلات، لازم بروفة قبل الاستلام بخمسة أيام.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <input
              type="checkbox"
              checked={needsFitting || needsAlterations}
              disabled={needsAlterations}
              onChange={(event) => setNeedsFitting(event.target.checked)}
              className="mt-1 h-4 w-4 accent-rose-500"
            />
            <span>
              <span className="block font-medium">يحتاج بروفة</span>
              <span className="mt-1 block text-rose-400">
                {needsFitting || needsAlterations
                  ? `موعد البروفة ${formatDate(fittingDateForPickup(startDate))}`
                  : "اختياري إذا ما في تعديلات."}
              </span>
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">العربون المدفوع الآن</span>
            <input
              type="number"
              min="0"
              step="0.001"
              value={depositPaid}
              onChange={(event) => setDepositPaid(event.target.value)}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2 text-rose-900"
              placeholder="0"
            />
            <span className="mt-1 block text-xs text-rose-400">
              المتبقي على العميلة {formatCurrency(Math.max(0, quote.total - (Number(depositPaid) || 0)))}
            </span>
          </label>
          <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
            <p className="font-medium">تأمين الفستان {formatCurrency(dress.insuranceAmount)}</p>
            <p className="mt-1 text-xs leading-6 text-violet-700/80">
              يُحصَل الآن مع العربون، ويُرجَع للعميلة عند الإرجاع إذا الفستان سليم. التأمين مو من فلوس الإيجار.
            </p>
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
              <p className="text-xs text-emerald-700/80">
                إيجار فقط. التأمين {formatCurrency(dress.insuranceAmount)} يُحصَل ويرجع، وما يدخل في الدخل.
              </p>
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
