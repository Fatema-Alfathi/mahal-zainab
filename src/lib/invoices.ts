import type { Booking } from "@/types";

const INVOICE_PREFIX = "ZNB-INV-";

export function suggestInvoiceNumber(bookings: Booking[]): string {
  const used = new Set(bookings.map((item) => item.invoiceNumber.trim().toUpperCase()));
  for (let index = 1; index < 10000; index += 1) {
    const candidate = `${INVOICE_PREFIX}${String(index).padStart(3, "0")}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${INVOICE_PREFIX}${Date.now().toString().slice(-6)}`;
}

export function assignInvoiceNumbers(bookings: Booking[]): Booking[] {
  return bookings.map((item, index) => ({
    ...item,
    invoiceNumber: item.invoiceNumber || `${INVOICE_PREFIX}${String(index + 1).padStart(3, "0")}`,
  }));
}
