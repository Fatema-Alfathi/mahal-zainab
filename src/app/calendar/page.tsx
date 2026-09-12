"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { DressBookingCalendar } from "@/components/DressBookingCalendar";

export default function CalendarPage() {
  return (
    <AppShell active="calendar">
      <Suspense fallback={<p className="text-sm text-slate-500">تحميل تقويم الفساتين…</p>}>
        <DressBookingCalendar />
      </Suspense>
    </AppShell>
  );
}
