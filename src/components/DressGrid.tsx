"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { ReturnDialog } from "@/components/ReturnDialog";
import { useShop } from "@/context/ShopContext";
import { DRESS_PRESENTATION } from "@/data/mockData";
import { cn, formatCurrency } from "@/lib/format";
import type { Dress, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-teal-50 text-teal-800",
  rented: "bg-[#eee8e4] text-stone-600",
  maintenance: "bg-[#f0ebe4] text-stone-500",
};

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  rented: "مؤجَّر",
  maintenance: "صيانة",
};

export function DressGrid() {
  const { dresses, bookings, isOwner, completeMaintenance } = useShop();
  const [bookingDress, setBookingDress] = useState<Dress | null>(null);
  const [returningDress, setReturningDress] = useState<Dress | null>(null);

  const activeCustomerByDress = useMemo(() => {
    const map = new Map<string, string>();
    for (const booking of bookings) {
      if (booking.status === "active") map.set(booking.dressId, booking.customerName);
    }
    return map;
  }, [bookings]);

  return (
    <section>
      <div className="mb-5">
        <p className="text-sm text-stone-400">المخزون</p>
        <h2 className="mt-1 text-3xl font-medium text-stone-800">فساتين المحل</h2>
        <p className="mt-2 text-sm leading-7 text-stone-500">التوفر والحجوزات والإرجاع والعناية بعد التأجير.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dresses.map((dress) => {
          const presentation = DRESS_PRESENTATION[dress.id];
          const guest = activeCustomerByDress.get(dress.id);
          return (
            <article key={dress.id} className="overflow-hidden rounded-3xl bg-white/80 transition hover:bg-white">
              <div className={cn("relative flex h-36 items-end bg-gradient-to-br p-4", presentation?.palette)}>
                <span className="absolute start-4 top-4 font-serif text-5xl text-stone-900/10">
                  {dress.name.charAt(0)}
                </span>
                <div>
                  <p className="text-[11px] text-stone-500">{presentation?.designer ?? "محل زينب"}</p>
                  <h3 className="text-xl leading-tight text-stone-800">{dress.name}</h3>
                </div>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs", STATUS_STYLES[dress.status])}>
                    {STATUS_LABELS[dress.status]}
                  </span>
                  <span className="text-xs text-stone-500">{presentation?.silhouette}</span>
                </div>
                {isOwner ? (
                  <p className="text-sm text-stone-600">
                    إيجار اليوم{" "}
                    <span className="tabular-nums text-stone-800">{formatCurrency(dress.rentalPricePerDay)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-stone-500">
                    {dress.status === "available"
                      ? "جاهز لحجز زبونة جديدة."
                      : dress.status === "rented"
                        ? guest
                          ? `حالياً مع ${guest}.`
                          : "مؤجَّر حالياً."
                        : "في العناية بعد التأجير قبل إعادته للصالة."}
                  </p>
                )}
                {dress.status === "rented" && guest ? (
                  <p className="text-xs text-stone-500">مؤجَّر · {guest}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {dress.status === "available" ? (
                    <button
                      type="button"
                      onClick={() => setBookingDress(dress)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      حجز الفستان
                    </button>
                  ) : null}
                  {dress.status === "rented" ? (
                    <button
                      type="button"
                      onClick={() => setReturningDress(dress)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-600 px-3 py-1.5 text-xs text-white hover:bg-stone-500"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      تسجيل الإرجاع
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <button
                      type="button"
                      onClick={() => completeMaintenance(dress.id)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-500 px-3 py-1.5 text-xs text-white hover:bg-stone-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      إعادة للصالة
                    </button>
                  ) : null}
                  {dress.status === "maintenance" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {isOwner ? "تم تسجيل التنظيف الجاف" : "العناية جارية"}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {bookingDress ? <BookingModal dress={bookingDress} onClose={() => setBookingDress(null)} /> : null}
      {returningDress ? <ReturnDialog dress={returningDress} onClose={() => setReturningDress(null)} /> : null}
    </section>
  );
}
