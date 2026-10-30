import { FITTING_LEAD_DAYS, type Customer, type CustomerDraft, type Booking } from "@/types";
import { suggestCode } from "@/lib/codes";
import { shiftIso } from "@/lib/format";

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export function suggestCustomerNumber(customers: Customer[]): string {
  return suggestCode(
    "C",
    customers.map((item) => item.number),
  );
}

export function isCustomerNumberTaken(customers: Customer[], number: string, excludeId?: string): boolean {
  const key = number.trim().toUpperCase();
  if (!key) return false;
  return customers.some((item) => item.id !== excludeId && item.number.trim().toUpperCase() === key);
}

export function matchCustomer(customers: Customer[], name: string, phone?: string): Customer | undefined {
  const phoneKey = normalizePhone(phone ?? "");
  if (phoneKey) {
    const byPhone = customers.find((item) => normalizePhone(item.phone) === phoneKey);
    if (byPhone) return byPhone;
  }
  const nameKey = name.trim();
  if (!nameKey) return undefined;
  return customers.find((item) => item.name.trim() === nameKey);
}

export function normalizeCustomerDraft(draft: CustomerDraft): CustomerDraft | null {
  const name = draft.name.trim();
  const number = draft.number.trim();
  const phone = normalizePhone(draft.phone);
  if (!name || !number || !phone) return null;
  return {
    number,
    name,
    phone,
    eventDate: draft.eventDate,
    notes: draft.notes.trim(),
  };
}

export function fittingDateForPickup(pickupDate: string): string {
  return shiftIso(pickupDate, -FITTING_LEAD_DAYS);
}

export function resolveFitting(needsAlterations: boolean, wantsFitting: boolean, pickupDate: string) {
  const needsFitting = needsAlterations || wantsFitting;
  return {
    needsAlterations,
    needsFitting,
    fittingDate: needsFitting ? fittingDateForPickup(pickupDate) : "",
  };
}

export function customerBookings(bookings: Booking[], customerId: string): Booking[] {
  return bookings
    .filter((booking) => booking.customerId === customerId)
    .sort((a, b) => (a.bookedAt < b.bookedAt ? 1 : -1));
}

export function customerOpenBookings(bookings: Booking[], customerId: string): Booking[] {
  return customerBookings(bookings, customerId).filter((booking) => booking.status !== "cancelled");
}

export function cancelledBookings(bookings: Booking[]): Booking[] {
  return bookings
    .filter((booking) => booking.status === "cancelled")
    .sort((a, b) => (a.cancelledAt || a.bookedAt) < (b.cancelledAt || b.bookedAt) ? 1 : -1);
}

export function bookingWeddingDate(booking: Booking | undefined, customer?: Customer): string {
  return booking?.eventDate || customer?.eventDate || "";
}

export function countedBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((booking) => booking.status !== "cancelled");
}
