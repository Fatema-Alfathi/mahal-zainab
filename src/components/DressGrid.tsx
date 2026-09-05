"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, RotateCcw, Sparkles, X } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { ReturnDialog } from "@/components/ReturnDialog";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { SizeFilter, type SizeFilterValue } from "@/components/SizeFilter";
import { useShop } from "@/context/ShopContext";
import { categoryLabel, dressDisplay, measurementLine, sizeLabel } from "@/lib/dressCatalog";
import { cn, formatCurrency } from "@/lib/format";
import type { Dress, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  rented: "bg-amber-100 text-amber-800",
  maintenance: "bg-violet-100 text-violet-800",
};

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  rented: "مؤجَّر",
  maintenance: "صيانة",
};

type StatusFilter = "all" | DressStatus;

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "available", label: "متاح" },
  { id: "rented", label: "مؤجَّر" },
  { id: "maintenance", label: "صيانة" },
];

export function DressGrid() {
  const { dresses, bookings, isOwner, completeMaintenance } = useShop();
  const [bookingDress, setBookingDress] = useState<Dress | null>(null);
  const [returningDress, setReturningDress] = useState<Dress | null>(null);
  const [barcodeDress, setBarcodeDress] = useState<Dress | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilterValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");

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
    return statusOk && sizeOk && categoryOk;
  });

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">الصالة</p>
          <h2 className="mt-1 text-3xl font-medium text-rose-900">فساتين المحل</h2>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">احجزي، رجّعي، أو أرجعي الفستان للصالة بعد العناية.</p>
        </div>
        <Link href="/dresses" className="shop-btn-gold rounded-2xl px-4 py-2 text-sm">
          إدارة الفساتين
        </Link>
      </div>
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                statusFilter === filter.id ? "shop-btn" : "bg-white/80 text-rose-400 hover:bg-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        <SizeFilter value={sizeFilter} onChange={setSizeFilter} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDresses.length === 0 ? (
          <p className="shop-card rounded-3xl px-4 py-8 text-center text-sm text-rose-400 sm:col-span-2 xl:col-span-3">
            ما في فساتين بهذي الحالة أو التصنيف أو المقاس حالياً.
          </p>
        ) : null}
        {visibleDresses.map((dress) => {
          const presentation = dressDisplay(dress);
          const guest = activeCustomerByDress.get(dress.id);
          return (
            <article key={dress.id} className="shop-card overflow-hidden rounded-3xl transition hover:-translate-y-0.5">
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
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs", STATUS_STYLES[dress.status])}>
                    {STATUS_LABELS[dress.status]}
                  </span>
                  <span className="text-xs text-rose-400">{presentation.silhouette}</span>
                </div>
                <p className="flex flex-wrap gap-2 text-sm text-rose-800">
                  <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs text-pink-800">{categoryLabel(dress.category)}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">{sizeLabel(dress.size)}</span>
                </p>
                {measurementLine(dress.measurements) ? (
                  <p className="text-xs leading-6 text-rose-400">{measurementLine(dress.measurements)}</p>
                ) : null}
                {isOwner ? (
                  <p className="text-sm text-rose-700">
                    إيجار اليوم{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.rentalPricePerDay)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-rose-500">
                    {dress.status === "available"
                      ? "جاهز لحجز زبونة جديدة."
                      : dress.status === "rented"
                        ? guest
                          ? `حالياً مع ${guest}.`
                          : "مؤجَّر حالياً."
                        : "في العناية بعد التأجير قبل إعادته للصالة."}
                  </p>
                )}
                {dress.status === "rented" && guest ? (
                  <p className="text-xs text-amber-700">مؤجَّر · {guest}</p>
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
                  {dress.status === "available" ? (
                    <button
                      type="button"
                      onClick={() => setBookingDress(dress)}
                      className="shop-btn inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      حجز الفستان
                    </button>
                  ) : null}
                  {dress.status === "rented" ? (
                    <button
                      type="button"
                      onClick={() => setReturningDress(dress)}
                      className="shop-btn-gold inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      تسجيل الإرجاع
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <button
                      type="button"
                      onClick={() => completeMaintenance(dress.id)}
                      className="shop-btn-violet inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      إعادة للصالة
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-violet-400">
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
      {bookingDress ? <BookingModal dress={bookingDress} onClose={() => setBookingDress(null)} /> : null}
      {returningDress ? <ReturnDialog dress={returningDress} onClose={() => setReturningDress(null)} /> : null}
      {barcodeDress ? <BarcodeDialog dress={barcodeDress} onClose={() => setBarcodeDress(null)} /> : null}
    </section>
  );
}

function BarcodeDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق الباركود" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="barcode-title" className="shop-card relative w-full max-w-sm rounded-3xl p-6">
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
