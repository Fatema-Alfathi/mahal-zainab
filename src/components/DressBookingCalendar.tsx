"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DressPhoto } from "@/components/DressPhoto";
import { useShop } from "@/context/ShopContext";
import {
  bookingRecordLabel,
  bookingRecordLine,
  dressBookingHistory,
  markDressDay,
  monthCells,
  nearestBookingDate,
} from "@/lib/dressCalendar";
import { categoryLabel, dressDisplay, matchesDressQuery, sizeLabel } from "@/lib/dressCatalog";
import {
  WEEKDAYS_SAT_AR,
  cn,
  formatDate,
  monthYearLabel,
  shiftMonthsIso,
  startOfMonthIso,
  todayIso,
} from "@/lib/format";
import type { Booking, Dress } from "@/types";

export function DressBookingCalendar() {
  const { dresses, bookings } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("dress") ?? "";
  const [dressId, setDressId] = useState(requestedId);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const visibleDresses = dresses.filter((dress) => matchesDressQuery(dress, query));
  const selected =
    visibleDresses.find((item) => item.id === dressId) ??
    visibleDresses[0] ??
    dresses.find((item) => item.id === dressId) ??
    dresses.find((item) => item.id === requestedId) ??
    dresses[0] ??
    null;

  useEffect(() => {
    if (requestedId) setDressId(requestedId);
  }, [requestedId]);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const matches = dresses.filter((item) => matchesDressQuery(item, term));
    if (matches.length === 0) return;
    if (matches.some((item) => item.id === dressId)) return;
    setDressId(matches[0].id);
  }, [dressId, dresses, query]);

  function selectDress(dress: Dress) {
    setDressId(dress.id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("dress", dress.id);
    const term = query.trim();
    if (term) params.set("q", term);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--salla-primary)]">سجل الحجوزات</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          تقويم الفساتين
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
          ابحثي بالاسم أو الكود، وتقويم هالفستان يظهر مباشرة مع تواريخ حجوزاته.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <aside className="dash-panel flex max-h-[44rem] flex-col overflow-hidden rounded-2xl lg:max-h-[calc(100vh-12rem)]">
          <div className="border-b border-[var(--salla-border)] p-4">
            <p className="mb-2 text-sm font-semibold text-[var(--foreground)]">اختاري فستان</p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--salla-muted)]"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحثي بالاسم أو الكود"
                className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 py-2.5 pe-3 ps-10 text-sm outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                aria-label="البحث عن فستان لعرض تقويمه"
              />
            </div>
            {query.trim() && visibleDresses.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--salla-muted)]">
                تقويم {visibleDresses[0].name}
                {visibleDresses.length > 1 ? ` · ${visibleDresses.length} نتائج` : ""}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[var(--salla-muted)]">
                {visibleDresses.length} من {dresses.length} فستان
              </p>
            )}
          </div>

          <ul className="flex-1 space-y-1 overflow-y-auto p-2">
            {visibleDresses.length === 0 ? (
              <li className="px-3 py-10 text-center text-sm text-[var(--salla-muted)]">ما في فستان بهالبحث.</li>
            ) : (
              visibleDresses.map((dress) => {
                const display = dressDisplay(dress);
                const active = selected?.id === dress.id;
                return (
                  <li key={dress.id}>
                    <button
                      type="button"
                      onClick={() => selectDress(dress)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-2 text-start transition",
                        active
                          ? "bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#1d1e20]"
                          : "hover:bg-[var(--salla-soft)]",
                      )}
                    >
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--salla-border)]">
                        <DressPhoto src={display.images[0]} alt="" fallbackClassName={display.palette} />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{dress.name}</span>
                        <span
                          className={cn(
                            "mt-0.5 block text-xs",
                            active ? "text-white/80 dark:text-[#1d1e20]/70" : "text-[var(--salla-muted)]",
                          )}
                          dir="ltr"
                        >
                          {dress.barcode}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-xs",
                            active ? "text-white/75 dark:text-[#1d1e20]/65" : "text-[var(--salla-muted)]",
                          )}
                        >
                          {categoryLabel(dress.category)} · {sizeLabel(dress.size)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {selected ? (
          <DressCalendarPanel key={selected.id} dress={selected} bookings={bookings} />
        ) : (
          <div className="dash-panel flex items-center justify-center rounded-2xl px-4 py-16 text-sm text-[var(--salla-muted)]">
            أضيفي فستان أولاً عشان يظهر التقويم.
          </div>
        )}
      </div>
    </section>
  );
}

export function DressCalendarPanel({ dress, bookings }: { dress: Dress; bookings: Booking[] }) {
  const today = todayIso();
  const focus = nearestBookingDate(bookings, dress.id, today);
  const [monthIso, setMonthIso] = useState(() => startOfMonthIso(focus));
  const [pickedDate, setPickedDate] = useState(focus);
  const history = useMemo(() => dressBookingHistory(bookings, dress.id), [bookings, dress.id]);
  const cells = useMemo(() => monthCells(monthIso), [monthIso]);
  const pickedMark = markDressDay(dress, bookings, pickedDate);

  return (
    <div className="space-y-4">
      <div className="dash-panel overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--salla-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--salla-primary)_7%,var(--salla-surface)),var(--salla-surface)_60%)] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[var(--salla-muted)]" dir="ltr">
                {dress.barcode}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{dress.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Legend tone="upcoming" label="محجوز قادم" />
                <Legend tone="out" label="عند العميلة" />
                <Legend tone="past" label="حجز سابق" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] p-1">
              <button
                type="button"
                onClick={() => setMonthIso((current) => shiftMonthsIso(current, -1))}
                className="rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                aria-label="الشهر السابق"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
              <p className="min-w-32 text-center text-sm font-semibold text-[var(--foreground)]">
                {monthYearLabel(monthIso)}
              </p>
              <button
                type="button"
                onClick={() => setMonthIso((current) => shiftMonthsIso(current, 1))}
                className="rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                aria-label="الشهر التالي"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonthIso(startOfMonthIso(today));
                  setPickedDate(today);
                }}
                className="ms-1 rounded-lg bg-[var(--salla-primary)] px-3 py-1.5 text-xs font-medium text-white dark:text-[#1d1e20]"
              >
                اليوم
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-[var(--salla-muted)]">
            {WEEKDAYS_SAT_AR.map((day) => (
              <div key={day} className="py-1.5 font-medium">
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-12 rounded-xl" />;
              }
              const { mark, bookings: dayItems } = markDressDay(dress, bookings, date);
              const isToday = date === today;
              const isPicked = date === pickedDate;
              const guest = dayItems[0]?.customerName;
              const dayNumber = Number(date.slice(8, 10));
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setPickedDate(date)}
                  className={cn(
                    "min-h-12 rounded-xl px-1 py-1.5 text-sm font-medium transition",
                    mark === "none" &&
                      "bg-[var(--salla-soft)]/70 text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
                    mark === "upcoming" && "bg-sky-600 text-white",
                    mark === "out" && "bg-amber-400 text-amber-950",
                    mark === "past" && "bg-[var(--salla-primary)] text-white dark:text-[#1d1e20]",
                    isToday && "ring-2 ring-[var(--salla-secondary)] ring-offset-1 ring-offset-[var(--salla-surface)]",
                    isPicked && "outline outline-2 outline-offset-1 outline-[var(--salla-primary)]",
                  )}
                  aria-label={
                    guest
                      ? `${formatDate(date)}، ${bookingRecordLabel(dayItems[0], dress)} لـ ${guest}`
                      : `${formatDate(date)}، ما في حجز`
                  }
                >
                  <span className="block tabular-nums">{dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dash-panel rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-[var(--salla-primary)]">
            <CalendarDays className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs text-[var(--salla-muted)]">اليوم المحدد</p>
            <h3 className="text-base font-semibold text-[var(--foreground)]">{formatDate(pickedDate)}</h3>
          </div>
        </div>
        {pickedMark.bookings.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-[var(--salla-border)] px-3 py-4 text-sm text-[var(--salla-muted)]">
            ما في حجز على هالفستان بهاليوم. تقدرين تحجزينه.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pickedMark.bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3 py-3 text-sm text-[var(--foreground)]"
              >
                {bookingRecordLine(booking, dress)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dash-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-[var(--foreground)]">كل حجوزات {dress.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--salla-muted)]">{history.length} حجز مسجّل</p>
        </div>
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--salla-border)] px-3 py-6 text-center text-sm text-[var(--salla-muted)]">
            ما انحجز هالفستان إلى الآن.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMonthIso(startOfMonthIso(booking.startDate));
                    setPickedDate(booking.startDate);
                  }}
                  className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-3 py-3 text-start text-sm text-[var(--foreground)] transition hover:bg-[var(--salla-soft)]"
                >
                  {bookingRecordLine(booking, dress)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: "upcoming" | "out" | "past"; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-[var(--foreground)]">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          tone === "upcoming" && "bg-sky-600",
          tone === "out" && "bg-amber-400",
          tone === "past" && "bg-[var(--salla-primary)]",
        )}
      />
      {label}
    </span>
  );
}
