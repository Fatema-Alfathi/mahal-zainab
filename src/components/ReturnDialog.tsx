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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق نافذة الإرجاع" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="return-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-stone-400">الإرجاع إلى المحل</p>
            <h3 id="return-title" className="mt-1 text-2xl text-stone-800">
              تسجيل إرجاع {dress.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-stone-600">
          <p className="flex items-start gap-2">
            <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />
            تنتقل الحالة من «مؤجَّر» إلى «صيانة» للعناية بعد التأجير.
          </p>
          {isOwner ? (
            <p className="flex items-start gap-2 rounded-xl bg-[#f3f1ee] px-3 py-2 text-stone-700">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              تُسجَّل رسوم تنظيف جاف إلزامية بقيمة {formatCurrency(DRY_CLEANING_FEE)} ضمن المصروفات
              المتغيرة وتُربط بهذا الفستان لحساب العائد.
            </p>
          ) : (
            <p className="rounded-xl bg-stone-50 px-3 py-2">
              تُسجَّل العناية القياسية بعد التأجير تلقائياً. يعود الفستان إلى الصالة بعد انتهاء الصيانة.
            </p>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-2xl bg-stone-700 py-2.5 text-sm text-white hover:bg-stone-600"
          >
            تأكيد الإرجاع
          </button>
          <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-100">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
