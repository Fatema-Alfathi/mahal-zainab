import { codeFor, suggestCode } from "@/lib/codes";
import type { Booking } from "@/types";

export function suggestInvoiceNumber(bookings: Booking[]): string {
  return suggestCode(
    "INV",
    bookings.map((item) => item.invoiceNumber),
  );
}

export function assignInvoiceNumbers(bookings: Booking[]): Booking[] {
  return bookings.map((item, index) => ({
    ...item,
    invoiceNumber: item.invoiceNumber || codeFor("INV", index + 1),
  }));
}
