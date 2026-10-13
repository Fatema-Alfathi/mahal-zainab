import { t } from "@/i18n/t";
import { formatDateOrDash } from "@/lib/format";
import type { Booking } from "@/types";

export type BookingScheduleRow = {
  key: "booked" | "fitting" | "pickup" | "wedding" | "handover" | "return";
  label: string;
  iso: string;
  value: string;
};

export function bookingScheduleRows(
  booking: Booking,
  options?: { showBooked?: boolean; hideEmpty?: boolean },
): BookingScheduleRow[] {
  const hideEmpty = options?.hideEmpty ?? true;
  const showBooked = options?.showBooked ?? true;
  const rows: Array<Omit<BookingScheduleRow, "value"> | null> = [
    showBooked ? { key: "booked", label: t("customers.bookedAt"), iso: booking.bookedAt } : null,
    { key: "fitting", label: t("customers.fittingDay"), iso: booking.fittingDate },
    { key: "pickup", label: t("customers.pickup"), iso: booking.pickupDate },
    { key: "wedding", label: t("customers.wedding"), iso: booking.eventDate },
    { key: "handover", label: t("customers.handover"), iso: booking.handoverDate },
    { key: "return", label: t("customers.return"), iso: booking.returnDate },
  ];

  return rows
    .filter((row): row is Omit<BookingScheduleRow, "value"> => Boolean(row))
    .filter((row) => !hideEmpty || Boolean(row.iso))
    .map((row) => ({ ...row, value: formatDateOrDash(row.iso) }));
}
