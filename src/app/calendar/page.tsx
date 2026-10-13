"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { DressBookingCalendar } from "@/components/DressBookingCalendar";
import { ShopDayBoard } from "@/components/ShopDayBoard";
import { useLanguage } from "@/i18n/LanguageProvider";

function CalendarFallback() {
  const { t } = useLanguage();
  return <p className="text-sm text-[var(--salla-muted)]">{t("cal.loading")}</p>;
}

export default function CalendarPage() {
  return (
    <AppShell active="calendar">
      <div className="space-y-6">
        <ShopDayBoard />
        <Suspense fallback={<CalendarFallback />}>
          <DressBookingCalendar />
        </Suspense>
      </div>
    </AppShell>
  );
}
