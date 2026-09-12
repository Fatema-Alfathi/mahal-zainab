"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section>
      <div className="mb-6">
        <p className="text-sm text-rose-400">سجل الحجوزات</p>
        <h1 className="mt-1 text-3xl font-medium text-rose-900">تقويم الفساتين</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
          ابحثي بالاسم أو الكود، وتقويم هالفستان يظهر مباشرة مع تواريخ حجوزاته.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
        <aside className="shop-card rounded-2xl p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">اختاري فستان</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحثي بالاسم أو الكود"
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 text-sm outline-none ring-rose-200 focus:ring-2"
              aria-label="البحث عن فستان لعرض تقويمه"
            />
          </label>
          {query.trim() && visibleDresses.length > 0 ? (
            <p className="mt-2 text-xs leading-6 text-rose-500">
              تقويم {visibleDresses[0].name}
              {visibleDresses.length > 1 ? ` · ${visibleDresses.length} نتائج` : ""}
            </p>
          ) : null}
          <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto">
            {visibleDresses.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-rose-400">ما في فستان بهالبحث.</li>
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
                        "flex w-full items-center gap-3 rounded-2xl p-2 text-start",
                        active ? "bg-[#004d5b] text-white" : "bg-rose-50 text-rose-900 hover:bg-rose-100",
                      )}
                    >
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded-xl">
                        <DressPhoto
                          src={display.images[0]}
                          alt=""
                          fallbackClassName={display.palette}
                        />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{dress.name}</span>
                        <span className={cn("mt-0.5 block text-xs", active ? "text-white/80" : "text-rose-400")} dir="ltr">
                          {dress.barcode}
                        </span>
                        <span className={cn("mt-0.5 block text-xs", active ? "text-white/80" : "text-rose-500")}>
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
          <p className="shop-card rounded-2xl px-4 py-10 text-center text-sm text-rose-400">أضيفي فستان أولاً عشان يظهر التقويم.</p>
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
      <div className="shop-card rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-rose-400" dir="ltr">
              {dress.barcode}
            </p>
            <h2 className="mt-1 text-xl text-rose-900">{dress.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonthIso((current) => shiftMonthsIso(current, -1))}
              className="rounded-full p-2 text-rose-700 hover:bg-rose-50"
              aria-label="الشهر السابق"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <p className="min-w-36 text-center text-sm font-medium text-rose-900">{monthYearLabel(monthIso)}</p>
            <button
              type="button"
              onClick={() => setMonthIso((current) => shiftMonthsIso(current, 1))}
              className="rounded-full p-2 text-rose-700 hover:bg-rose-50"
              aria-label="الشهر التالي"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthIso(startOfMonthIso(today));
                setPickedDate(today);
              }}
              className="rounded-2xl bg-rose-50 px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100"
            >
              اليوم
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <Legend tone="upcoming" label="محجوز قادم" />
          <Legend tone="out" label="عند العميلة" />
          <Legend tone="past" label="حجز سابق" />
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-rose-400">
          {WEEKDAYS_SAT_AR.map((day) => (
            <div key={day} className="py-1 font-medium">
              {day}
            </div>
          ))}
          {cells.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="min-h-12 rounded-2xl" />;
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
                  "min-h-12 rounded-2xl px-1 py-1.5 text-sm",
                  mark === "none" && "bg-rose-50/80 text-rose-900 hover:bg-rose-100",
                  mark === "upcoming" && "bg-sky-600 text-white",
                  mark === "out" && "bg-yellow-400 text-yellow-950",
                  mark === "past" && "bg-[#004d5b] text-white",
                  isToday && "ring-2 ring-[#73fcd7] ring-offset-1",
                  isPicked && "outline outline-2 outline-offset-1 outline-rose-900",
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

      <div className="shop-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-rose-900">
          <CalendarDays className="h-5 w-5 text-rose-400" aria-hidden />
          <h3 className="text-lg">{formatDate(pickedDate)}</h3>
        </div>
        {pickedMark.bookings.length === 0 ? (
          <p className="mt-3 text-sm leading-7 text-rose-500">ما في حجز على هالفستان بهاليوم. تقدرين تحجزينه.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pickedMark.bookings.map((booking) => (
              <li key={booking.id} className="rounded-2xl bg-rose-50 px-3 py-3 text-sm text-rose-900">
                {bookingRecordLine(booking, dress)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shop-card rounded-2xl p-4 sm:p-5">
        <h3 className="text-lg text-rose-900">كل حجوزات {dress.name}</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-rose-400">ما انحجز هالفستان إلى الآن.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMonthIso(startOfMonthIso(booking.startDate));
                    setPickedDate(booking.startDate);
                  }}
                  className="w-full rounded-2xl bg-rose-50 px-3 py-3 text-start text-sm text-rose-900 hover:bg-rose-100"
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
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-3 w-3 rounded-full",
          tone === "upcoming" && "bg-sky-600",
          tone === "out" && "bg-yellow-400",
          tone === "past" && "bg-[#004d5b]",
        )}
      />
      {label}
    </span>
  );
}
