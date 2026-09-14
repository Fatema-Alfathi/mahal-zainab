"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, HandHeart, RotateCcw, Scissors, Shirt, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { monthCells } from "@/lib/dressCalendar";
import {
  shopDayEvents,
  shopDayPrimaryTone,
  shopMonthEvents,
  type ShopDayEvent,
  type ShopDayKind,
  type ShopDayTone,
} from "@/lib/shopDay";
import {
  cn,
  formatDate,
  formatDateLong,
  monthYearLabel,
  shiftMonthsIso,
  startOfMonthIso,
  todayIso,
  weekdaysSat,
} from "@/lib/format";

const KIND_ICON: Record<ShopDayKind, typeof CalendarDays> = {
  return: RotateCcw,
  out: HandHeart,
  prep: Shirt,
  alteration: Scissors,
  cleaning: Sparkles,
};

const TONE_CELL: Record<ShopDayTone, string> = {
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-400 text-yellow-950",
  wine: "bg-[#8b1530] text-white",
  blue: "bg-sky-600 text-white",
};

const TONE_ROW: Record<ShopDayTone, string> = {
  red: "shop-tint-red",
  yellow: "shop-tint-yellow",
  wine: "bg-rose-50 ring-1 ring-[#8b1530]/20",
  blue: "shop-tint-blue",
};

const TONE_ICON: Record<ShopDayTone, string> = {
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-400 text-yellow-950",
  wine: "bg-[#8b1530] text-white",
  blue: "bg-sky-600 text-white",
};

export function ShopDayBoard() {
  const { dresses, bookings } = useShop();
  const { t, dir, locale } = useLanguage();
  const today = todayIso();
  const [monthIso, setMonthIso] = useState(() => startOfMonthIso(today));
  const [pickedDate, setPickedDate] = useState(today);
  const cells = useMemo(() => monthCells(monthIso), [monthIso]);
  const monthEvents = useMemo(() => shopMonthEvents(dresses, bookings, monthIso, today), [bookings, dresses, locale, monthIso, today]);
  const events = useMemo(
    () => shopDayEvents(dresses, bookings, pickedDate, today),
    [bookings, dresses, locale, pickedDate, today],
  );
  const heading = pickedDate === today ? t("cal.todayWork") : t("cal.dayWork", { date: formatDate(pickedDate) });
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="mb-8" aria-label={t("cal.shopAria")}>
      <div className="mb-5">
        <p className="text-sm text-rose-400">{t("cal.shopKicker")}</p>
        <h1 className="mt-1 text-3xl font-medium text-rose-900">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">{t("cal.shopLead")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,22rem)]">
        <div className="shop-card rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-rose-400" suppressHydrationWarning>
                {formatDateLong(today)}
              </p>
              <h2 className="mt-1 text-xl text-rose-900">{monthYearLabel(monthIso)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthIso((current) => shiftMonthsIso(current, -1))}
                className="rounded-full p-2 text-rose-700 hover:bg-rose-50"
                aria-label={t("previousMonth")}
              >
                <PrevIcon className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setMonthIso((current) => shiftMonthsIso(current, 1))}
                className="rounded-full p-2 text-rose-700 hover:bg-rose-50"
                aria-label={t("nextMonth")}
              >
                <NextIcon className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonthIso(startOfMonthIso(today));
                  setPickedDate(today);
                }}
                className="rounded-2xl bg-rose-50 px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100"
              >
                {t("today")}
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-3 text-xs text-rose-600">
            <Legend tone="red" label={t("cal.legendReturn")} />
            <Legend tone="yellow" label={t("cal.legendOut")} />
            <Legend tone="wine" label={t("cal.legendPrep")} />
            <Legend tone="blue" label={t("cal.legendAlt")} />
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-rose-400">
            {weekdaysSat().map((day) => (
              <div key={day} className="py-1 font-medium">
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-12 rounded-2xl" />;
              }
              const dayEvents = monthEvents.get(date) ?? [];
              const tone = shopDayPrimaryTone(dayEvents);
              const isToday = date === today;
              const isPicked = date === pickedDate;
              const dayNumber = Number(date.slice(8, 10));
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setPickedDate(date)}
                  className={cn(
                    "min-h-12 rounded-2xl px-1 py-1.5 text-sm",
                    tone ? TONE_CELL[tone] : "bg-rose-50/80 text-rose-900 hover:bg-rose-100",
                    isToday && "ring-2 ring-[#d4a017] ring-offset-1",
                    isPicked && "outline outline-2 outline-offset-1 outline-rose-900",
                  )}
                  aria-label={
                    dayEvents.length > 0
                      ? `${formatDate(date)}, ${t("cal.tasks", { n: dayEvents.length })}`
                      : `${formatDate(date)}, ${t("cal.noWork")}`
                  }
                >
                  <span className="block tabular-nums">{dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="shop-card rounded-3xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-rose-900">
            <CalendarDays className="h-5 w-5 text-rose-400" aria-hidden />
            <h3 className="text-lg">{formatDate(pickedDate)}</h3>
          </div>
          {events.length === 0 ? (
            <p className="mt-3 text-sm leading-7 text-rose-500">
              {pickedDate === today ? t("cal.emptyToday") : t("cal.emptyDay")}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {events.map((event) => (
                <DayEventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function DayEventRow({ event }: { event: ShopDayEvent }) {
  const Icon = KIND_ICON[event.kind];
  return (
    <li>
      <Link
        href={`/calendar/?dress=${event.dressId}`}
        className={cn("flex items-start gap-3 rounded-2xl px-3 py-3", TONE_ROW[event.tone])}
      >
        <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl", TONE_ICON[event.tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-rose-900">{event.title}</span>
          <span className="mt-0.5 block text-xs leading-5 text-rose-500">{event.detail}</span>
        </span>
      </Link>
    </li>
  );
}

function Legend({ tone, label }: { tone: ShopDayTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-full", TONE_CELL[tone])} />
      {label}
    </span>
  );
}
