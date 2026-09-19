"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Ban,
  HandHeart,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { DailyAlerts } from "@/components/DailyAlerts";
import { DressCalendarPanel } from "@/components/DressBookingCalendar";
import { DressBarcode } from "@/components/DressBarcode";
import { DressGallery } from "@/components/DressGallery";
import { ReturnDialog } from "@/components/ReturnDialog";
import { CategoryFilter, Chip, type CategoryFilterValue } from "@/components/CategoryFilter";
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
  available: "bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] text-[var(--salla-success)]",
  reserved: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  rented: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  maintenance: "bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] text-[var(--salla-danger)]",
};

type StatusFilter = "all" | DressStatus;

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
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--salla-primary)]">{t("floor.kicker")}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {t("floor.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">{t("floor.lead")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
          >
            <CalendarDays className="h-4 w-4 text-[var(--salla-primary)]" aria-hidden />
            {t("floor.calendar")}
          </Link>
          <Link href="/dresses" className="shop-btn inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium">
            {t("floor.manage")}
          </Link>
        </div>
      </div>

      <DailyAlerts compact />

      {/* Filters panel */}
      <div className="dash-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--salla-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCalendarDressId(null);
            }}
            placeholder={t("floor.searchPh")}
            className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 py-2.5 pe-4 ps-10 text-sm outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            aria-label={t("floor.searchAria")}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--salla-muted)]">{t("floor.filterStatus")}</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("floor.filterStatus")}>
            {FILTER_IDS.map((id) => (
              <Chip key={id} active={statusFilter === id} onClick={() => setStatusFilter(id)}>
                {id === "all" ? t("all") : dressStatusLabel(id)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-t border-[var(--salla-border)] pt-4 lg:grid-cols-3">
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
          <ColorFilter value={colorFilter} onChange={setColorFilter} />
          <SizeFilter value={sizeFilter} onChange={setSizeFilter} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--salla-border)] pt-3 text-xs text-[var(--salla-muted)]">
          <span>
            يظهر {visibleDresses.length} من {dresses.length} فستان
          </span>
          {calendarDress ? (
            <span className="text-[var(--salla-primary)]">
              تقويم {calendarDress.name}
              {visibleDresses.length > 1 ? ` · ${visibleDresses.length} نتائج` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {calendarDress ? (
        <div>
          <DressCalendarPanel key={calendarDress.id} dress={calendarDress} bookings={bookings} />
        </div>
      ) : null}

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDresses.length === 0 ? (
          <p className="shop-card rounded-3xl px-4 py-8 text-center text-sm text-[var(--salla-muted)] sm:col-span-2 xl:col-span-3">
            {t("floor.emptyFilters")}
          </p>
        ) : null}

        {visibleDresses.map((dress) => {
          const presentation = dressDisplay(dress);
          const guest = activeCustomerByDress.get(dress.id);
          const windows = dressActiveBookings(bookings, dress.id);
          const needsAlteration = dressNeedsAlteration(dress, bookings);

          return (
            <article
              key={dress.id}
              className="dash-panel group flex flex-col overflow-hidden rounded-2xl transition hover:border-[color-mix(in_srgb,var(--salla-primary)_28%,var(--salla-border))]"
            >
              <div className="relative overflow-hidden">
                <DressGallery
                  images={presentation.images}
                  alt={dress.name}
                  fallbackClassName={presentation.palette}
                  heightClass="h-52 sm:h-56"
                />
                <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", STATUS_STYLES[dress.status])}>
                    {dressStatusLabel(dress.status)}
                  </span>
                  {needsAlteration ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900">
                      {t("status.needsAlteration")}
                    </span>
                  ) : null}
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
                  <span className="text-xs text-[var(--salla-muted)]">{presentation.silhouette}</span>
                </div>
                <p className="flex flex-wrap gap-2 text-sm text-[var(--foreground)]">
                  <span className="rounded-full bg-[var(--salla-soft)] px-2.5 py-1 text-xs text-[var(--foreground)]">
                    {categoryLabel(dress.category)}
                  </span>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-800">{colorLabel(dress.color)}</span>
                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs text-yellow-800">{sizeLabel(dress.size)}</span>
                </p>
                <DressVariants dress={dress} dresses={dresses} />

                {measurementLine(dress.measurements) ? (
                  <p className="text-xs leading-5 text-[var(--salla-muted)]">{measurementLine(dress.measurements)}</p>
                ) : null}

                {isOwner ? (
                  <p className="text-sm text-[var(--foreground)]">
                    إيجار اليوم{" "}
                    <span className="font-semibold tabular-nums text-[var(--salla-primary)]">
                      {formatCurrency(dress.rentalPricePerDay)}
                    </span>
                    <span className="text-[var(--salla-muted)]">
                      {" "}
                      · تأمين {formatCurrency(dress.insuranceAmount)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-[var(--salla-muted)]">
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
                  <p className="text-sm text-[var(--foreground)]">
                    {t("floor.insurance")}{" "}
                    <span className="tabular-nums text-[var(--foreground)]">{formatCurrency(dress.insuranceAmount)}</span>
                    <span className="text-[var(--salla-muted)]"> · {t("floor.insuranceHint")}</span>
                  </p>
                ) : null}

                {windows.length > 0 ? (
                  <div className="space-y-1 rounded-xl bg-[var(--salla-soft)] px-3 py-2 text-xs text-[var(--foreground)]">
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
                  className="shop-soft w-full rounded-2xl px-3 py-2 hover:bg-[var(--salla-soft)]"
                  aria-label={t("floor.barcodeAria", { name: dress.name })}
                >
                  <DressBarcode value={dress.barcode} height={36} moduleWidth={1} />
                </button>

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {query.trim() ? (
                    <ActionButton tone="ghost" onClick={() => setCalendarDressId(dress.id)}>
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.calendarShort")}
                    </ActionButton>
                  ) : (
                    <Link
                      href={`/calendar/?dress=${dress.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.calendarShort")}
                    </Link>
                  )}

                  {dress.status === "available" ? (
                    <ActionButton tone="success" onClick={() => setBookingDress(dress)}>
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.bookDress")}
                    </ActionButton>
                  ) : null}

                  {dress.status === "reserved" ? (
                    <ActionButton tone="warn" onClick={() => pickupDress(dress.id)}>
                      <HandHeart className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.pickupGuest")}
                    </ActionButton>
                  ) : null}

                  {dress.status === "rented" ? (
                    <ActionButton tone="danger" onClick={() => setReturningDress(dress)}>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.recordReturn")}
                    </ActionButton>
                  ) : null}

                  {dress.status === "maintenance" ? (
                    <ActionButton tone="success" onClick={() => completeMaintenance(dress.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {t("floor.finishCare")}
                    </ActionButton>
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
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--salla-danger)]">
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
        <BookingModal dress={bookingDress} onClose={() => setBookingDress(null)} onSwitchDress={setBookingDress} />
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

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[var(--salla-soft)] px-2 py-1 text-[11px] font-medium text-[var(--foreground)]">
      {children}
    </span>
  );
}

function ActionButton({
  tone,
  onClick,
  children,
}: {
  tone: "ghost" | "success" | "warn" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition",
        tone === "ghost" &&
          "border border-[var(--salla-border)] bg-[var(--salla-surface)] text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
        tone === "success" && "bg-[var(--salla-success)] text-white hover:brightness-95",
        tone === "warn" && "bg-amber-500 text-amber-950 hover:brightness-95",
        tone === "danger" && "bg-[var(--salla-danger)] text-white hover:brightness-95",
      )}
    >
      {children}
    </button>
  );
}

function BarcodeDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق الباركود" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-title"
        className="dash-panel relative w-full max-w-sm rounded-2xl p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--salla-muted)]">باركود الفستان</p>
            <h3 id="barcode-title" className="mt-1 text-xl font-semibold text-[var(--foreground)]">
              {dress.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-xl bg-[var(--salla-soft)] px-4 py-5">
          <DressBarcode value={dress.barcode} height={72} moduleWidth={1.4} />
        </div>
        <p className="mt-3 text-center text-sm text-[var(--salla-muted)]">{t("floor.barcodeHint")}</p>
      </div>
    </div>
  );
}
