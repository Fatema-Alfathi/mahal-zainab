import { t } from "@/i18n/t";
import { formatDate } from "@/lib/format";
import type { Booking, Customer, Dress } from "@/types";

export function whatsAppDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("968") && digits.length >= 11) return digits.slice(0, 11);
  if (digits.length === 8) return `968${digits}`;
  return digits.length >= 10 ? digits : null;
}

export function whatsAppHref(phone: string, text: string): string | null {
  const digits = whatsAppDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function moneyLine(amount: number): string {
  const rounded = Math.round(amount * 1000) / 1000;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return `${text} ${t("currency")}`;
}

export function customerPhone(customer: Customer | undefined, fallback = ""): string {
  return customer?.phone || fallback;
}

export function invoiceWhatsAppText(booking: Booking, dressName: string): string {
  return [
    t("invoice.brand"),
    t("invoice.numberLine", { invoice: booking.invoiceNumber }),
    t("invoice.clientLine", { name: booking.customerName }),
    t("invoice.dressLine", { dress: dressName }),
    t("invoice.pickupLine", { date: formatDate(booking.pickupDate || booking.startDate) }),
    t("invoice.returnLine", { date: formatDate(booking.returnDate || booking.endDate) }),
    t("invoice.totalLine", { amount: moneyLine(booking.totalRevenueGenerated) }),
    t("invoice.paidLine", { amount: moneyLine(booking.depositPaid) }),
    t("invoice.dueLine", { amount: moneyLine(booking.remainingAmount) }),
    t("invoice.insuranceLine", { amount: moneyLine(booking.insurancePaid) }),
  ].join("\n");
}

export function returnReminderText(booking: Booking, dressName: string): string {
  return t("remind.returnText", {
    name: booking.customerName,
    dress: dressName,
    date: formatDate(booking.returnDate || booking.endDate),
    invoice: booking.invoiceNumber,
  });
}

export function fittingReminderText(booking: Booking, dressName: string): string {
  return t("remind.fittingText", {
    name: booking.customerName,
    dress: dressName,
    date: formatDate(booking.fittingDate),
    invoice: booking.invoiceNumber,
  });
}

export function dressNameOf(dresses: Dress[], dressId: string): string {
  return dresses.find((item) => item.id === dressId)?.name ?? dressId;
}
