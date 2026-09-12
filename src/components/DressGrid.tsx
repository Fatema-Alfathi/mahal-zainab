"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CalendarPlus, CheckCircle2, HandHeart, RotateCcw, Sparkles, X } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { DressCalendarPanel } from "@/components/DressBookingCalendar";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { ReturnDialog } from "@/components/ReturnDialog";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { ColorFilter, type ColorFilterValue } from "@/components/ColorFilter";
import { DressVariants } from "@/components/DressVariants";
import { SizeFilter, type SizeFilterValue } from "@/components/SizeFilter";
import { useShop } from "@/context/ShopContext";
import { categoryLabel, bookingDateLine, dressActiveBookings, dressDisplay, dressNeedsAlteration, matchesDressQuery, measurementLine, sizeLabel } from "@/lib/dressCatalog";
import { cn, formatCurrency } from "@/lib/format";
import type { Dress, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-[var(--salla-success)] text-white",
  reserved: "bg-sky-600 text-white",
  rented: "bg-yellow-400 text-yellow-950",
  maintenance: "bg-[var(--salla-danger)] text-white",
};

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  reserved: "محجوز",
  rented: "عند العميلة",
  maintenance: "يحتاج تنظيف",
};

type StatusFilter = "all" | DressStatus;

const FILTER_ACTIVE: Record<StatusFilter, string> = {
  all: "shop-btn",
  available: "shop-btn-green",
  reserved: "shop-btn-blue",
  rented: "shop-btn-yellow",
  maintenance: "shop-btn-red",
};

const CATEGORY_CHIP: Record<string, string> = {
  wedding: "bg-yellow-400 text-yellow-950",
  evening: "bg-red-600 text-white",
  soft: "bg-emerald-600 text-white",
  engagement: "bg-sky-600 text-white",
  henna: "bg-amber-500 text-amber-950",
  graduation: "bg-violet-600 text-white",
};

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "available", label: "متاح" },
  { id: "reserved", label: "محجوز" },
  { id: "rented", label: "عند العميلة" },
  { id: "maintenance", label: "يحتاج تنظيف" },
];

export function DressGrid() {
  const { dresses, bookings, isOwner, pickupDress, completeMaintenance } = useShop();
  const [bookingDress, setBookingDress] = useState<Dress | null>(null);
  const [returningDress, setReturningDress] = useState<Dress | null>(null);
  const [barcodeDress, setBarcodeDress] = useState<Dress | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilterValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");
  const [colorFilter, setColorFilter] = useState<ColorFilterValue>("all");
  const [query, setQuery] = useState("");
  const [calendarDressId, setCalendarDressId] = useState<string | null>(null);

  const activeCustomerByDress = useMemo(() => {
    const map = new Map<string, string>();
    for (const booking of bookings) {
      if (booking.status === "active") map.set(booking.dressId, booking.customerName);
    }
    return map;
  }, [bookings]);

  const visibleDresses = dresses.filter((dress) => {
    const statusOk = statusFilter === "all" || dress.status === statusFilter;
    const sizeOk = sizeFilter === "all" || dress.size === sizeFilter;
    const categoryOk = categoryFilter === "all" || dress.category === categoryFilter;
    const colorOk = colorFilter === "all" || dress.color === colorFilter;
    return statusOk && sizeOk && categoryOk && colorOk && matchesDressQuery(dress, query);
  });
  const calendarDress =
    visibleDresses.find((dress) => dress.id === calendarDressId) ??
    (query.trim() ? visibleDresses[0] : null);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">الصالة</p>
          <h2 className="mt-1 text-3xl font-medium text-rose-900">فساتين المحل</h2>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">
            ابحثي بالاسم أو الباركود، بعدين احجزي أو رجّعي أو أرجعي الفستان للصالة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/calendar" className="shop-soft rounded-2xl px-4 py-2 text-sm text-rose-800 hover:bg-rose-50">
            تقويم الحجوزات
          </Link>
          <Link href="/dresses" className="shop-btn-gold rounded-2xl px-4 py-2 text-sm">
            إدارة الفساتين
          </Link>
        </div>
      </div>
      <div className="mb-4 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCalendarDressId(null);
          }}
          placeholder="ابحثي بالاسم أو الباركود"
          className="w-full rounded-2xl border-0 bg-white/90 px-4 py-2.5 text-sm outline-none ring-rose-200 focus:ring-2"
          aria-label="البحث عن فستان بالاسم أو الباركود"
        />
        {calendarDress ? (
          <p className="text-sm text-rose-600">
            تقويم {calendarDress.name} من البحث
            {visibleDresses.length > 1 ? ` · ${visibleDresses.length} فساتين` : ""}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                statusFilter === filter.id ? FILTER_ACTIVE[filter.id] : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        <ColorFilter value={colorFilter} onChange={setColorFilter} />
        <SizeFilter value={sizeFilter} onChange={setSizeFilter} />
      </div>
      {calendarDress ? (
        <div className="mb-5">
          <DressCalendarPanel key={calendarDress.id} dress={calendarDress} bookings={bookings} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDresses.length === 0 ? (
          <p className="shop-card rounded-2xl px-4 py-8 text-center text-sm text-rose-400 sm:col-span-2 xl:col-span-3">
            ما في فساتين بهالبحث أو بهذي الحالة أو التصنيف أو اللون أو المقاس حالياً.
          </p>
        ) : null}
        {visibleDresses.map((dress) => {
          const presentation = dressDisplay(dress);
          const guest = activeCustomerByDress.get(dress.id);
          const windows = dressActiveBookings(bookings, dress.id);
          const needsAlteration = dressNeedsAlteration(dress, bookings);
          return (
            <article key={dress.id} className="shop-card overflow-hidden rounded-2xl transition hover:-translate-y-0.5">
              <div className="relative">
                <DressGallery
                  images={presentation.images}
                  alt={dress.name}
                  fallbackClassName={presentation.palette}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 p-4">
                  <p className="text-[11px] text-white/70">
                    {presentation.designer} · {categoryLabel(dress.category)}
                  </p>
                  <h3 className="text-xl leading-tight text-white">{dress.name}</h3>
                </div>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs", STATUS_STYLES[dress.status])}>
                      {STATUS_LABELS[dress.status]}
                    </span>
                    {needsAlteration ? (
                      <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-xs text-yellow-950">يحتاج تعديل</span>
                    ) : null}
                  </div>
                  <span className="text-xs text-rose-400">{presentation.silhouette}</span>
                </div>
                <p className="flex flex-wrap gap-2 text-sm text-rose-800">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs", CATEGORY_CHIP[dress.category] ?? "bg-rose-100 text-rose-800")}>{categoryLabel(dress.category)}</span>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-800">{dress.color}</span>
                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs text-yellow-800">{sizeLabel(dress.size)}</span>
                </p>
                <DressVariants dress={dress} dresses={dresses} />
                {measurementLine(dress.measurements) ? (
                  <p className="text-xs leading-6 text-rose-400">{measurementLine(dress.measurements)}</p>
                ) : null}
                {isOwner ? (
                  <p className="text-sm text-rose-700">
                    إيجار اليوم{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.rentalPricePerDay)}</span>
                    {" "}
                    · تأمين{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.insuranceAmount)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-rose-500">
                    {dress.status === "available"
                      ? "جاهز لحجز زبونة جديدة."
                      : dress.status === "reserved"
                        ? guest
                          ? `محجوز لـ ${guest} ولسه في المحل.`
                          : "محجوز ولسه في المحل."
                        : dress.status === "rented"
                          ? guest
                            ? `حالياً مع ${guest}.`
                            : "عند العميلة حالياً."
                          : "في العناية بعد التأجير قبل إعادته للصالة."}
                  </p>
                )}
                {!isOwner && dress.insuranceAmount > 0 ? (
                  <p className="text-sm text-rose-700">
                    تأمين{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.insuranceAmount)}</span>
                    <span className="text-rose-400"> · يُرجَع إذا الفستان سليم</span>
                  </p>
                ) : null}
                {windows.length > 0 ? (
                  <div className="space-y-1 text-xs text-sky-800">
                    {windows.map((booking) => (
                      <p key={booking.id}>
                        {dress.status === "rented" ? "عند العميلة" : "محجوز"} {bookingDateLine(booking)}
                        {booking.customerName ? ` — ${booking.customerName}` : ""}
                      </p>
                    ))}
                  </div>
                ) : dress.status === "reserved" && guest ? (
                  <p className="text-xs text-sky-700">محجوز · {guest}</p>
                ) : dress.status === "rented" && guest ? (
                  <p className="text-xs text-amber-700">عند العميلة · {guest}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setBarcodeDress(dress)}
                  className="shop-soft w-full rounded-2xl px-3 py-2 hover:bg-rose-50"
                  aria-label={`عرض باركود ${dress.name}`}
                >
                  <DressBarcode value={dress.barcode} height={38} moduleWidth={1} />
                </button>
                <div className="flex flex-wrap gap-2">
                  {query.trim() ? (
                    <button
                      type="button"
                      onClick={() => setCalendarDressId(dress.id)}
                      className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-50"
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      التقويم
                    </button>
                  ) : (
                    <Link
                      href={`/calendar/?dress=${dress.id}`}
                      className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-50"
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      التقويم
                    </Link>
                  )}
                  {dress.status === "available" ? (
                    <button
                      type="button"
                      onClick={() => setBookingDress(dress)}
                      className="shop-btn-green inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      حجز الفستان
                    </button>
                  ) : null}
                  {dress.status === "reserved" ? (
                    <button
                      type="button"
                      onClick={() => pickupDress(dress.id)}
                      className="shop-btn-yellow inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <HandHeart className="h-3.5 w-3.5" aria-hidden />
                      تسليم للعميلة
                    </button>
                  ) : null}
                  {dress.status === "rented" ? (
                    <button
                      type="button"
                      onClick={() => setReturningDress(dress)}
                      className="shop-btn-red inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      تسجيل الإرجاع
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <button
                      type="button"
                      onClick={() => completeMaintenance(dress.id)}
                      className="shop-btn-green inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      إعادة للصالة
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {isOwner ? "تم تسجيل التنظيف الجاف" : "العناية جارية"}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {bookingDress ? (
        <BookingModal
          dress={bookingDress}
          onClose={() => setBookingDress(null)}
          onSwitchDress={setBookingDress}
        />
      ) : null}
      {returningDress ? <ReturnDialog dress={returningDress} onClose={() => setReturningDress(null)} /> : null}
      {barcodeDress ? <BarcodeDialog dress={barcodeDress} onClose={() => setBarcodeDress(null)} /> : null}
    </section>
  );
}

function BarcodeDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق الباركود" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="barcode-title" className="shop-card relative w-full max-w-sm rounded-2xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-rose-400">باركود الفستان</p>
            <h3 id="barcode-title" className="mt-1 text-xl text-rose-900">
              {dress.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="shop-soft rounded-2xl px-4 py-5">
          <DressBarcode value={dress.barcode} height={72} moduleWidth={1.4} />
        </div>
        <p className="mt-3 text-center text-sm text-rose-400">يُستخدم للتعريف السريع عند الحجز والجرد.</p>
      </div>
    </div>
  );
}
