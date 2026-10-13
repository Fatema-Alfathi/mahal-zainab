"use client";

import { bookingScheduleRows } from "@/lib/bookingDates";
import type { Booking } from "@/types";

export function BookingDateList({
  booking,
  showBooked = true,
}: {
  booking: Booking;
  showBooked?: boolean;
}) {
  const rows = bookingScheduleRows(booking, { showBooked, hideEmpty: true });
  if (rows.length === 0) return null;

  return (
    <dl className="mt-2 space-y-1 text-xs text-[var(--salla-muted)]">
      {rows.map((row) => (
        <div key={row.key} className="flex justify-between gap-3">
          <dt>{row.label}</dt>
          <dd className="tabular-nums text-[var(--foreground)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
