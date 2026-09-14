import { t } from "@/i18n/t";
import { dressNeedsAlteration, dressNeedsCleaning } from "@/lib/dressCatalog";
import { endOfMonthIso, todayIso } from "@/lib/format";
import type { Booking, Dress } from "@/types";

export type ShopDayKind = "return" | "out" | "prep" | "alteration" | "cleaning";
export type ShopDayTone = "red" | "yellow" | "blue" | "wine";

export type ShopDayEvent = {
  id: string;
  kind: ShopDayKind;
  dressId: string;
  dressName: string;
  number: number;
  title: string;
  detail: string;
  tone: ShopDayTone;
};

const KIND_ORDER: ShopDayKind[] = ["return", "out", "prep", "alteration", "cleaning"];

function pickupOf(booking: Booking): string {
  return booking.pickupDate || booking.startDate;
}

function returnOf(booking: Booking): string {
  return booking.returnDate || booking.endDate;
}

function handoverOf(booking: Booking): string {
  return booking.handoverDate || "";
}

export function dressNumber(dress: Dress): number {
  const match = dress.barcode.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

export function dressNumberLabel(dress: Dress): string {
  const number = dressNumber(dress);
  return number > 0 ? t("cal.dressNumber", { n: number }) : dress.name;
}

function byId(dresses: Dress[]): Map<string, Dress> {
  return new Map(dresses.map((dress) => [dress.id, dress]));
}

function activeBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((booking) => booking.status === "active");
}

export function shopDayEvents(dresses: Dress[], bookings: Booking[], date: string, today = todayIso()): ShopDayEvent[] {
  const dressesById = byId(dresses);
  const events: ShopDayEvent[] = [];
  const seen = new Set<string>();
  const isToday = date === today;

  function push(event: ShopDayEvent) {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    events.push(event);
  }

  for (const booking of activeBookings(bookings)) {
    const dress = dressesById.get(booking.dressId);
    if (!dress) continue;
    const label = dressNumberLabel(dress);
    const number = dressNumber(dress);
    const who = booking.customerName ? ` — ${booking.customerName}` : "";
    const pickup = pickupOf(booking);
    const due = returnOf(booking);
    const handover = handoverOf(booking);

    if (due === date) {
      push({
        id: `return-${booking.id}`,
        kind: "return",
        dressId: dress.id,
        dressName: dress.name,
        number,
        title: t(isToday ? "cal.returnsToday" : "cal.returns", { dress: label }),
        detail: `${dress.name}${who}`,
        tone: "red",
      });
    } else if (date === today && due < today) {
      push({
        id: `return-${booking.id}`,
        kind: "return",
        dressId: dress.id,
        dressName: dress.name,
        number,
        title: t("cal.overdue", { dress: label }),
        detail: `${dress.name}${who}`,
        tone: "red",
      });
    }

    if (pickup === date || handover === date) {
      push({
        id: `out-${booking.id}`,
        kind: "out",
        dressId: dress.id,
        dressName: dress.name,
        number,
        title: t("cal.goesOut", { dress: label }),
        detail: `${dress.name}${who}`,
        tone: "yellow",
      });
    }

    const needsPrep =
      dress.status === "reserved" &&
      pickup >= date &&
      (dressNeedsAlteration(dress, [booking]) || booking.needsFitting);
    if (needsPrep && (date === today || pickup === date)) {
      push({
        id: `prep-${dress.id}`,
        kind: "prep",
        dressId: dress.id,
        dressName: dress.name,
        number,
        title: t("cal.needsPrep", { dress: label }),
        detail: pickup === date ? t("cal.pickupToday", { name: dress.name, who }) : t("cal.beforePickup", { name: dress.name }),
        tone: "wine",
      });
    }
  }

  if (date === today) {
    for (const dress of dresses) {
      const label = dressNumberLabel(dress);
      const number = dressNumber(dress);
      if (dressNeedsCleaning(dress)) {
        push({
          id: `clean-${dress.id}`,
          kind: "cleaning",
          dressId: dress.id,
          dressName: dress.name,
          number,
          title: t("cal.needsClean", { dress: label }),
          detail: dress.name,
          tone: "red",
        });
      }
      if (dressNeedsAlteration(dress, bookings) && dress.status === "available") {
        push({
          id: `alt-${dress.id}`,
          kind: "alteration",
          dressId: dress.id,
          dressName: dress.name,
          number,
          title: t("cal.needsAlt", { dress: label }),
          detail: dress.name,
          tone: "blue",
        });
      }
    }
  }

  return events.sort((left, right) => {
    const byKind = KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind);
    if (byKind !== 0) return byKind;
    return left.number - right.number;
  });
}

export function shopDayPrimaryTone(events: ShopDayEvent[]): ShopDayTone | null {
  if (events.some((event) => event.kind === "return" || event.kind === "cleaning")) return "red";
  if (events.some((event) => event.kind === "out")) return "yellow";
  if (events.some((event) => event.kind === "prep")) return "wine";
  if (events.some((event) => event.kind === "alteration")) return "blue";
  return null;
}

export function shopMonthEvents(
  dresses: Dress[],
  bookings: Booking[],
  monthIso: string,
  today = todayIso(),
): Map<string, ShopDayEvent[]> {
  const map = new Map<string, ShopDayEvent[]>();
  const start = `${monthIso.slice(0, 7)}-01`;
  const last = endOfMonthIso(start);
  const lastDay = Number(last.slice(8, 10));
  const month = start.slice(0, 7);
  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const events = shopDayEvents(dresses, bookings, date, today);
    if (events.length > 0) map.set(date, events);
  }
  return map;
}
