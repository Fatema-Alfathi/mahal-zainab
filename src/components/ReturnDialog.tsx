"use client";

import { Shirt, Sparkles, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { formatCurrency } from "@/lib/format";
import { DRY_CLEANING_FEE, type Dress } from "@/types";

export function ReturnDialog({ dress, onClose }: { dress: Dress; onClose: () => void }) {
  const { isOwner, returnDress } = useShop();

  function confirm() {
    returnDress(dress.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق نافذة الإرجاع" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="return-title" className="shop-card relative w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-rose-400">الإرجاع إلى المحل</p>
            <h3 id="return-title" className="mt-1 text-2xl text-rose-900">
              تسجيل إرجاع {dress.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-rose-700">
          <p className="flex items-start gap-2">
            <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
            تنتقل الحالة من «مؤجَّر» إلى «صيانة» للعناية بعد التأجير.
          </p>
          {isOwner ? (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              تُسجَّل رسوم تنظيف جاف إلزامية بقيمة {formatCurrency(DRY_CLEANING_FEE)} ضمن المصروفات
              المتغيرة وتُربط بهذا الفستان لحساب العائد.
            </p>
          ) : (
            <p className="rounded-xl bg-rose-50 px-3 py-2">
              تُسجَّل العناية القياسية بعد التأجير تلقائياً. يعود الفستان إلى الصالة بعد انتهاء الصيانة.
            </p>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={confirm}
            className="shop-btn-gold flex-1 rounded-2xl py-2.5 text-sm"
          >
            تأكيد الإرجاع
          </button>
          <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-50">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
