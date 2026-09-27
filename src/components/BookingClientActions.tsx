"use client";

import { useState } from "react";
import { Banknote, Printer, Scissors, RotateCcw } from "lucide-react";
import { CollectPaymentDialog } from "@/components/CollectPaymentDialog";
import { InvoiceSheet } from "@/components/InvoiceSheet";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";
import { fittingReminderText, returnReminderText } from "@/lib/whatsapp";
import type { Booking, Customer, Dress } from "@/types";

const btn =
  "inline-flex items-center gap-1 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]";

export function BookingClientActions({
  booking,
  dress,
  customer,
}: {
  booking: Booking;
  dress?: Dress;
  customer?: Customer;
}) {
  const { recordPayment } = useShop();
  const { t } = useLanguage();
  const [sheet, setSheet] = useState<"invoice" | "pay" | null>(null);
  const dressName = dress?.name ?? booking.dressId;
  const phone = customer?.phone ?? "";
  const canCollect = booking.status === "active" && booking.remainingAmount > 0;
  const canRemind = booking.status === "active";

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setSheet("invoice")} className={btn}>
          <Printer className="h-3.5 w-3.5" aria-hidden />
          {t("invoice.open")}
        </button>
        {canCollect ? (
          <button type="button" onClick={() => setSheet("pay")} className={cn(btn, "text-[var(--salla-primary)]")}>
            <Banknote className="h-3.5 w-3.5" aria-hidden />
            {t("pay.open")}
          </button>
        ) : null}
        {canRemind ? (
          <>
            <WhatsAppLink phone={phone} text={returnReminderText(booking, dressName)} className={cn(btn, "text-emerald-700")}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {t("remind.return")}
            </WhatsAppLink>
            {booking.fittingDate ? (
              <WhatsAppLink phone={phone} text={fittingReminderText(booking, dressName)} className={cn(btn, "text-emerald-700")}>
                <Scissors className="h-3.5 w-3.5" aria-hidden />
                {t("remind.fitting")}
              </WhatsAppLink>
            ) : null}
          </>
        ) : null}
      </div>
      {sheet === "invoice" ? (
        <InvoiceSheet booking={booking} dress={dress} customer={customer} onClose={() => setSheet(null)} />
      ) : null}
      {sheet === "pay" ? (
        <CollectPaymentDialog
          booking={booking}
          onClose={() => setSheet(null)}
          onSave={(amount) => recordPayment(booking.id, amount)}
        />
      ) : null}
    </>
  );
}
