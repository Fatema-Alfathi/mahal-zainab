import { t } from "@/i18n/t";
import { todayIso } from "@/lib/format";
import type { Booking, Employee } from "@/types";

export function monthKey(iso = todayIso()): string {
  return iso.slice(0, 7);
}

export function employeeMonthBookings(bookings: Booking[], employeeId: string, monthIso = todayIso()): Booking[] {
  const month = monthKey(monthIso);
  return bookings.filter(
    (booking) =>
      booking.bookedByEmployeeId === employeeId &&
      booking.bookedAt.startsWith(month) &&
      booking.status !== "cancelled",
  );
}

export function employeeMonthBookingCount(bookings: Booking[], employeeId: string, monthIso = todayIso()): number {
  return employeeMonthBookings(bookings, employeeId, monthIso).length;
}

export function staffMonthBookingRows(employees: Employee[], bookings: Booking[], monthIso = todayIso()) {
  return employees
    .map((employee) => ({
      employee,
      count: employeeMonthBookingCount(bookings, employee.id, monthIso),
    }))
    .sort((left, right) => {
      if (left.count !== right.count) return right.count - left.count;
      return left.employee.name.localeCompare(right.employee.name, "ar");
    });
}

export function staffBookingCountLabel(count: number): string {
  if (count === 0) return t("staff.bookingsNone");
  if (count === 1) return t("staff.bookingsOne");
  if (count === 2) return t("staff.bookingsTwo");
  if (count >= 3 && count <= 10) return t("staff.bookingsFew", { n: count });
  return t("staff.bookingsMany", { n: count });
}
