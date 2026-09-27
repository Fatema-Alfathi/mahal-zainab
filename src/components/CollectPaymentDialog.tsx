"use client";

import { FormEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency, formatDate } from "@/lib/format";
import { roundMoney } from "@/lib/finance";
import { moneyLine } from "@/lib/whatsapp";
import type { Booking } from "@/types";

export function CollectPaymentDialog({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking;
  onClose: () => void;
  onSave: (amount: number) => boolean;
}) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(String(booking.remainingAmount));
  const [error, setError] = useState("");
  const parsed = Number(amount);
  const nextRemain = useMemo(() => {
    if (!Number.isFinite(parsed) || parsed <= 0) return booking.remainingAmount;
    return roundMoney(Math.max(0, booking.remainingAmount - parsed));
  }, [booking.remainingAmount, parsed]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("pay.min");
      return;
    }
    if (parsed > booking.remainingAmount) {
      setError("pay.max");
      return;
    }
    if (!onSave(parsed)) {
      setError("pay.max");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("close")} onClick={onClose} />
      <div className="shop-card relative w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--salla-muted)]">{booking.invoiceNumber}</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{t("pay.title")}</h3>
            <p className="mt-1 text-sm text-[var(--salla-muted)]">{t("pay.now", { amount: formatCurrency(booking.remainingAmount) })}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]" aria-label={t("close")}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">{t("pay.amount")}</span>
            <input
              type="number"
              min={0}
              step="0.001"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)]"
            />
          </label>
          <p className="text-sm text-[var(--salla-muted)]">{t("pay.after", { amount: formatCurrency(nextRemain) })}</p>
          {booking.payments.length > 0 ? (
            <ul className="space-y-1 text-xs text-[var(--salla-muted)]">
              {booking.payments.map((payment) => (
                <li key={payment.id}>{t("pay.line", { amount: moneyLine(payment.amount), date: formatDate(payment.paidAt) })}</li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="text-sm text-[var(--salla-danger)]">{t(error)}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-2xl bg-[var(--salla-soft)] px-4 py-2 text-sm">
              {t("cancel")}
            </button>
            <button type="submit" className="shop-btn rounded-2xl px-4 py-2 text-sm">
              {t("pay.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
