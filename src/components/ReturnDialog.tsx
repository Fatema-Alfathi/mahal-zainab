"use client";

import { Shirt, Sparkles, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency } from "@/lib/format";
import { DRY_CLEANING_FEE, type Dress } from "@/types";

export function ReturnDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  const { bookings, isOwner, returnDress } = useShop();
  const { t } = useLanguage();
  const activeBooking = bookings.find((booking) => booking.dressId === dress.id && booking.status === "active");
  const insuranceToReturn = activeBooking?.insurancePaid ?? dress.insuranceAmount;

  function confirm() {
    returnDress(dress.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("return.closeAria")} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="return-title" className="shop-card relative w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-rose-400">{t("return.kicker")}</p>
            <h3 id="return-title" className="mt-1 text-2xl text-rose-900">
              {t("return.recordTitle", { name: dress.name })}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label={t("close")}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-rose-700">
          <p className="flex items-start gap-2">
            <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
            {t("return.statusChange")}
          </p>
          {isOwner ? (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {t("return.cleaningFee", { amount: formatCurrency(DRY_CLEANING_FEE) })}
            </p>
          ) : (
            <p className="rounded-xl bg-rose-50 px-3 py-2">{t("return.body")}</p>
          )}
          {insuranceToReturn > 0 ? (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-violet-900">
              {t("return.insuranceBack", { amount: formatCurrency(insuranceToReturn) })}
            </p>
          ) : null}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={confirm}
            className="shop-btn-gold flex-1 rounded-2xl py-2.5 text-sm"
          >
            {t("return.confirm")}
          </button>
          <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-50">
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
