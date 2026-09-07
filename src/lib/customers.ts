import { FITTING_LEAD_DAYS, type Customer, type CustomerDraft, type Booking } from "@/types";
import { shiftIso } from "@/lib/format";

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export function suggestCustomerNumber(customers: Customer[]): string {
  const used = new Set(customers.map((item) => item.number.trim().toUpperCase()));
  for (let index = 1; index < 1000; index += 1) {
    const candidate = `ZNB-C-${String(index).padStart(3, "0")}`;
    if (!used.has(candidate)) return candidate;
  }
  return `ZNB-C-${Date.now().toString().slice(-6)}`;
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
