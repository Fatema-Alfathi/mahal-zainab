"use client";

import { Printer, X } from "lucide-react";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BookingDateList } from "@/components/BookingDateList";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceWhatsAppText, moneyLine } from "@/lib/whatsapp";
import type { Booking, Customer, Dress } from "@/types";

export function InvoiceSheet({
  booking,
  dress,
  customer,
  onClose,
}: {
  booking: Booking;
  dress?: Dress;
  customer?: Customer;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const dressName = dress?.name ?? booking.dressId;
  const phone = customer?.phone ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default no-print" aria-label={t("close")} onClick={onClose} />
      <div className="invoice-print-root shop-card relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3 no-print">
          <div>
            <p className="text-xs font-medium text-[var(--salla-muted)]">{t("invoice.kicker")}</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{t("invoice.title")}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]" aria-label={t("close")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">{t("invoice.brand")}</p>
            <p className="mt-1 font-medium tabular-nums text-[var(--salla-primary)]">{booking.invoiceNumber}</p>
          </div>
          <dl className="grid gap-2">
            <Row label={t("invoice.client")} value={booking.customerName} />
            {phone ? <Row label={t("customers.phone")} value={phone} /> : null}
            <Row label={t("customers.dress")} value={dressName} />
            {dress?.barcode ? <Row label={t("customers.fieldCode")} value={dress.barcode} /> : null}
          </dl>
          <BookingDateList booking={booking} />
          <dl className="grid gap-2 border-t border-[var(--salla-border)] pt-3">
            <Row label={t("customers.price")} value={formatCurrency(booking.totalRevenueGenerated)} />
            <Row label={t("invoice.paid")} value={formatCurrency(booking.depositPaid)} />
            <Row label={t("invoice.due")} value={formatCurrency(booking.remainingAmount)} />
            <Row
              label={t("customers.insurance")}
              value={`${formatCurrency(booking.insurancePaid)} · ${booking.insuranceReturned ? t("customers.insuranceBack") : t("customers.insuranceShop")}`}
            />
          </dl>
          {booking.payments.length > 0 ? (
            <div>
              <p className="text-xs text-[var(--salla-muted)]">{t("pay.history")}</p>
              <ul className="mt-1 space-y-1">
                {booking.payments.map((payment) => (
                  <li key={payment.id} className="text-xs text-[var(--foreground)]">
                    {t("pay.line", { amount: moneyLine(payment.amount), date: formatDate(payment.paidAt) })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2 no-print">
          <WhatsAppLink
            phone={phone}
            text={invoiceWhatsAppText(booking, dressName)}
            className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {t("invoice.whatsapp")}
          </WhatsAppLink>
          <button type="button" onClick={() => window.print()} className="shop-btn inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm">
            <Printer className="h-4 w-4" aria-hidden />
            {t("invoice.print")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--salla-muted)]">{label}</dt>
      <dd className="text-end font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
