"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CalendarPlus, CheckCircle2, Ban, HandHeart, RotateCcw, Sparkles, X } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { DailyAlerts } from "@/components/DailyAlerts";
import { DressCalendarPanel } from "@/components/DressBookingCalendar";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { ReturnDialog } from "@/components/ReturnDialog";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { ColorFilter, type ColorFilterValue } from "@/components/ColorFilter";
import { DressVariants } from "@/components/DressVariants";
import { SizeFilter, type SizeFilterValue } from "@/components/SizeFilter";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categoryLabel, bookingDateLine, dressActiveBookings, dressDisplay, dressNeedsAlteration, matchesDressQuery, measurementLine, sizeLabel } from "@/lib/dressCatalog";
import { cn, formatCurrency } from "@/lib/format";
import { colorLabel, dressStatusLabel } from "@/lib/labels";
import type { Dress, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-emerald-600 text-white",
  reserved: "bg-sky-600 text-white",
  rented: "bg-yellow-400 text-yellow-950",
  maintenance: "bg-red-600 text-white",
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

const FILTER_IDS: StatusFilter[] = ["all", "available", "reserved", "rented", "maintenance"];

export function DressGrid() {
  const { dresses, bookings, isOwner, pickupDress, completeMaintenance, cancelBooking } = useShop();
  const { t } = useLanguage();
  const [bookingDress, setBookingDress] = useState<Dress | null>(null);
  const [returningDress, setReturningDress] = useState<Dress | null>(null);
  const [barcodeDress, setBarcodeDress] = useState<Dress | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
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

  function staffStatusCopy(dress: Dress, guest?: string) {
    if (dress.status === "available") return t("floor.ready");
    if (dress.status === "reserved") {
      return guest ? t("floor.reservedFor", { guest }) : t("floor.reservedInShop");
    }
    if (dress.status === "rented") {
      return guest ? t("floor.withNamedNow", { guest }) : t("floor.withGuest");
    }
    return t("floor.inCare");
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">{t("floor.kicker")}</p>
          <h2 className="mt-1 text-3xl font-medium text-rose-900">{t("floor.title")}</h2>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">{t("floor.lead")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/calendar" className="shop-soft rounded-2xl px-4 py-2 text-sm text-rose-800 hover:bg-rose-50">
            {t("floor.calendar")}
          </Link>
          <Link href="/dresses" className="shop-btn-gold rounded-2xl px-4 py-2 text-sm">
            {t("floor.manage")}
          </Link>
        </div>
      </div>
      <div className="mb-5">
        <DailyAlerts compact />
      </div>
      <div className="mb-4 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCalendarDressId(null);
          }}
          placeholder={t("floor.searchPh")}
          className="w-full rounded-2xl border-0 bg-white/90 px-4 py-2.5 text-sm outline-none ring-rose-200 focus:ring-2"
          aria-label={t("floor.searchAria")}
        />
        {calendarDress ? (
          <p className="text-sm text-rose-600">
            {t("floor.calendarOf", { name: calendarDress.name })}
            {visibleDresses.length > 1 ? t("floor.moreDresses", { n: visibleDresses.length }) : ""}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("floor.filterStatus")}>
          {FILTER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                statusFilter === id ? FILTER_ACTIVE[id] : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
              )}
            >
              {id === "all" ? t("all") : dressStatusLabel(id)}
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
          <p className="shop-card rounded-3xl px-4 py-8 text-center text-sm text-rose-400 sm:col-span-2 xl:col-span-3">
            {t("floor.emptyFilters")}
          </p>
        ) : null}
        {visibleDresses.map((dress) => {
          const presentation = dressDisplay(dress);
          const guest = activeCustomerByDress.get(dress.id);
          const windows = dressActiveBookings(bookings, dress.id);
          const needsAlteration = dressNeedsAlteration(dress, bookings);
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs", STATUS_STYLES[dress.status])}>
                      {dressStatusLabel(dress.status)}
                    </span>
                    {needsAlteration ? (
                      <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-xs text-yellow-950">{t("floor.needsAlt")}</span>
                    ) : null}
                  </div>
                  <span className="text-xs text-rose-400">{presentation.silhouette}</span>
                </div>
                <p className="flex flex-wrap gap-2 text-sm text-rose-800">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs", CATEGORY_CHIP[dress.category] ?? "bg-rose-100 text-rose-800")}>{categoryLabel(dress.category)}</span>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-800">{colorLabel(dress.color)}</span>
                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs text-yellow-800">{sizeLabel(dress.size)}</span>
                </p>
                <DressVariants dress={dress} dresses={dresses} />
                {measurementLine(dress.measurements) ? (
                  <p className="text-xs leading-6 text-rose-400">{measurementLine(dress.measurements)}</p>
                ) : null}
                {isOwner ? (
                  <p className="text-sm text-rose-700">
                    {t("floor.dayRent")}{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.rentalPricePerDay)}</span>
                    {" "}
                    · {t("floor.insurance")}{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.insuranceAmount)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-rose-500">{staffStatusCopy(dress, guest)}</p>
                )}
                {!isOwner && dress.insuranceAmount > 0 ? (
                  <p className="text-sm text-rose-700">
                    {t("floor.insurance")}{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.insuranceAmount)}</span>
                    <span className="text-rose-400"> · {t("floor.insuranceHint")}</span>
                  </p>
                ) : null}
                {windows.length > 0 ? (
                  <div className="space-y-1 text-xs text-sky-800">
                    {windows.map((booking) => (
                      <p key={booking.id}>
                        {dressStatusLabel(dress.status === "rented" ? "rented" : "reserved")} {bookingDateLine(booking)}
                        {booking.customerName ? ` — ${booking.customerName}` : ""}
                      </p>
                    ))}
                  </div>
                ) : dress.status === "reserved" && guest ? (
                  <p className="text-xs text-sky-700">{t("floor.reservedNamed", { guest })}</p>
                ) : dress.status === "rented" && guest ? (
                  <p className="text-xs text-amber-700">{t("floor.rentedNamed", { guest })}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setBarcodeDress(dress)}
                  className="shop-soft w-full rounded-2xl px-3 py-2 hover:bg-rose-50"
                  aria-label={t("floor.barcodeAria", { name: dress.name })}
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
                      {t("floor.calendarShort")}
                    </button>
                  ) : (
                    <Link
                      href={`/calendar/?dress=${dress.id}`}
                      className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-50"
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.calendarShort")}
                    </Link>
                  )}
                  {dress.status === "available" ? (
                    <button
                      type="button"
                      onClick={() => setBookingDress(dress)}
                      className="shop-btn-green inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.bookDress")}
                    </button>
                  ) : null}
                  {dress.status === "reserved" ? (
                    <button
                      type="button"
                      onClick={() => pickupDress(dress.id)}
                      className="shop-btn-yellow inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <HandHeart className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.pickupGuest")}
                    </button>
                  ) : null}
                  {dress.status === "rented" ? (
                    <button
                      type="button"
                      onClick={() => setReturningDress(dress)}
                      className="shop-btn-red inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.recordReturn")}
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <button
                      type="button"
                      onClick={() => completeMaintenance(dress.id)}
                      className="shop-btn-green inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.finishCare")}
                    </button>
                  ) : null}
                  {dress.status === "reserved" || dress.status === "rented" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const booking = bookings.find((item) => item.dressId === dress.id && item.status === "active");
                        if (booking) setPendingCancelId(booking.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                    >
                      <Ban className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.cancelBooking")}
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {isOwner ? t("floor.doneCleaning") : t("floor.careRunning")}
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
      {pendingCancelId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
          <button type="button" className="absolute inset-0 cursor-default" aria-label={t("close")} onClick={() => setPendingCancelId(null)} />
          <div className="shop-card relative w-full max-w-md rounded-3xl p-6">
            <h3 className="text-xl text-rose-900">{t("floor.cancelTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-rose-600">{t("floor.cancelBody")}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setPendingCancelId(null)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-800">
                {t("floor.undo")}
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(pendingCancelId);
                  setPendingCancelId(null);
                }}
                className="shop-btn-red rounded-2xl px-4 py-2 text-sm"
              >
                {t("floor.confirmCancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BarcodeDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("floor.closeBarcode")} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="barcode-title" className="shop-card relative w-full max-w-sm rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-rose-400">{t("floor.barcodeTitle")}</p>
            <h3 id="barcode-title" className="mt-1 text-xl text-rose-900">
              {dress.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label={t("close")}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="shop-soft rounded-2xl px-4 py-5">
          <DressBarcode value={dress.barcode} height={72} moduleWidth={1.4} />
        </div>
        <p className="mt-3 text-center text-sm text-rose-400">{t("floor.barcodeHint")}</p>
      </div>
    </div>
  );
}
