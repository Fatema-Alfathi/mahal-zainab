"use client";

import { Suspense } from "react";
import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { DressBookingCalendar } from "@/components/DressBookingCalendar";

export default function CalendarPage() {
  return (
    <div className="min-h-full text-[#2a0c12]">
      <BoutiqueHeader active="calendar" />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Suspense fallback={<p className="text-sm text-rose-400">تحميل تقويم الفساتين…</p>}>
          <DressBookingCalendar />
        </Suspense>
      </main>
    </div>
  );
}
