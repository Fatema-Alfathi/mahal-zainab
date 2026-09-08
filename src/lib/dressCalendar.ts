import { bookingDateLine } from "@/lib/dressCatalog";
import { isIsoInRange, startOfMonthIso, weekdaySatIndex } from "@/lib/format";
import type { Booking, Dress } from "@/types";

export type DressDayMark = "none" | "upcoming" | "out" | "past";

export function dressBookingHistory(bookings: Booking[], dressId: string): Booking[] {
  return bookings
    .filter((booking) => booking.dressId === dressId)
    .sort((left, right) => {
      const byStart = right.startDate.localeCompare(left.startDate);
      if (byStart !== 0) return byStart;
      return right.endDate.localeCompare(left.endDate);
    });
}

export function bookingCoversDate(booking: Booking, date: string): boolean {
  return isIsoInRange(date, booking.startDate, booking.endDate);
}

export function bookingsOnDate(bookings: Booking[], dressId: string, date: string): Booking[] {
  return dressBookingHistory(bookings, dressId).filter((booking) => bookingCoversDate(booking, date));
}

export function markDressDay(
  dress: Dress,
  bookings: Booking[],
  date: string,
): { mark: DressDayMark; bookings: Booking[] } {
  const covering = bookingsOnDate(bookings, dress.id, date);
  const active = covering.find((booking) => booking.status === "active");
  if (active) {
    return {
      mark: dress.status === "rented" ? "out" : "upcoming",
      bookings: covering,
    };
  }
  if (covering.length > 0) return { mark: "past", bookings: covering };
  return { mark: "none", bookings: [] };
}

export function bookingRecordLabel(booking: Booking, dress: Dress): string {
  if (booking.status === "completed") return "حجز سابق";
  if (dress.status === "rented") return "عند العميلة";
  return "محجوز";
}

export function bookingRecordLine(booking: Booking, dress: Dress): string {
  const who = booking.customerName ? ` — ${booking.customerName}` : "";
  return `${bookingRecordLabel(booking, dress)} ${bookingDateLine(booking)}${who}`;
}

export function nearestBookingDate(bookings: Booking[], dressId: string, today: string): string {
  const history = dressBookingHistory(bookings, dressId);
  const upcoming = [...history]
    .filter((booking) => booking.endDate >= today)
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
  if (upcoming[0]) {
    if (isIsoInRange(today, upcoming[0].startDate, upcoming[0].endDate)) return today;
    return upcoming[0].startDate;
  }
  if (history[0]) return history[0].startDate;
  return today;
}

export function nearestBookingMonth(bookings: Booking[], dressId: string, today: string): string {
  return startOfMonthIso(nearestBookingDate(bookings, dressId, today));
}

export function monthCells(monthIso: string): Array<string | null> {
  const start = startOfMonthIso(monthIso);
  const year = Number(start.slice(0, 4));
  const month = Number(start.slice(5, 7));
  const lastDay = new Date(year, month, 0).getDate();
  const cells: Array<string | null> = Array.from({ length: weekdaySatIndex(start) }, () => null);
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push(`${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
