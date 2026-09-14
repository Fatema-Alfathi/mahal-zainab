import { dressNeedsAlteration } from "@/lib/dressCatalog";
import { t } from "@/i18n/t";
import { joinArabic } from "@/lib/labels";
import { formatDate, shiftIso, todayIso } from "@/lib/format";
import type { Booking, Dress } from "@/types";

export type DailyAlertKind =
  | "return-overdue"
  | "return-today"
  | "cleaning"
  | "pickup-today"
  | "prep"
  | "booking-tomorrow";

export type DailyAlertTone = "red" | "yellow" | "blue" | "wine";

export type DailyAlertItem = {
  dressId: string;
  dressName: string;
  customerName: string;
  note: string;
};

export type DailyAlert = {
  id: DailyAlertKind;
  kind: DailyAlertKind;
  title: string;
  detail: string;
  tone: DailyAlertTone;
  items: DailyAlertItem[];
};

function dressMap(dresses: Dress[]): Map<string, Dress> {
  return new Map(dresses.map((dress) => [dress.id, dress]));
}

function pickupOf(booking: Booking): string {
  return booking.pickupDate || booking.startDate;
}

function returnOf(booking: Booking): string {
  return booking.returnDate || booking.endDate;
}

function activeBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((booking) => booking.status === "active");
}

function namedItem(dress: Dress, booking?: Booking, note = ""): DailyAlertItem {
  return {
    dressId: dress.id,
    dressName: dress.name,
    customerName: booking?.customerName ?? "",
    note,
  };
}

function namesLine(items: DailyAlertItem[]): string {
  return joinArabic(
    items.map((item) => (item.customerName ? t("alert.namedFor", { dress: item.dressName, name: item.customerName }) : item.dressName)),
  );
}

function dressesCountPhrase(
  count: number,
  named: string | undefined,
  kind: "overdue" | "returnToday" | "clean" | "pickup" | "prep" | "tomorrow",
): string {
  if (count === 1 && named) return `${named} ${t(`alert.${kind}.one`)}`;
  if (count === 1) return t("alert.dressWord", { phrase: t(`alert.${kind}.one`) });
  if (count === 2) return t(`alert.${kind}.two`);
  if (count >= 3 && count <= 10) return `${count} ${t(`alert.${kind}.few`)}`;
  return `${count} ${t(`alert.${kind}.many`)}`;
}

function alertsCountLabel(count: number): string {
  if (count === 0) return t("alerts.none");
  if (count === 1) return t("alerts.one");
  if (count === 2) return t("alerts.two");
  if (count >= 3 && count <= 10) return t("alerts.few", { n: count });
  return t("alerts.many", { n: count });
}

export function dailyAlertCountLabel(count: number): string {
  return alertsCountLabel(count);
}

function buildAlert(
  kind: DailyAlertKind,
  items: DailyAlertItem[],
  tone: DailyAlertTone,
  phraseKind: "overdue" | "returnToday" | "clean" | "pickup" | "prep" | "tomorrow",
  detailForOne?: string,
  title?: string,
): DailyAlert | null {
  if (items.length === 0) return null;
  const named = items.length === 1 ? items[0].dressName : undefined;
  return {
    id: kind,
    kind,
    title: title ?? dressesCountPhrase(items.length, named, phraseKind),
    detail: items.length === 1 ? (detailForOne ?? items[0].note) : namesLine(items),
    tone,
    items,
  };
}

export function dailyAlerts(dresses: Dress[], bookings: Booking[], today = todayIso()): DailyAlert[] {
  const byId = dressMap(dresses);
  const active = activeBookings(bookings);
  const tomorrow = shiftIso(today, 1);
  const seenPrep = new Set<string>();

  const cleaningItems = dresses.filter((dress) => dress.status === "maintenance").map((dress) => namedItem(dress));

  const overdueItems: DailyAlertItem[] = [];
  const returnTodayItems: DailyAlertItem[] = [];
  const pickupTodayItems: DailyAlertItem[] = [];
  const tomorrowItems: DailyAlertItem[] = [];
  const prepItems: DailyAlertItem[] = [];

  for (const booking of active) {
    const dress = byId.get(booking.dressId);
    if (!dress) continue;
    const pickup = pickupOf(booking);
    const due = returnOf(booking);

    if (due < today) {
      overdueItems.push(namedItem(dress, booking, t("alert.wasDue", { date: formatDate(due) })));
    } else if (due === today) {
      returnTodayItems.push(
        namedItem(dress, booking, booking.customerName ? t("alert.from", { name: booking.customerName }) : t("alert.returnTodayNote")),
      );
    }

    if (pickup === today && dress.status !== "rented") {
      pickupTodayItems.push(
        namedItem(dress, booking, booking.customerName ? t("alert.handoverTo", { name: booking.customerName }) : t("alert.handoverToday")),
      );
    }

    if (pickup === tomorrow) {
      tomorrowItems.push(
        namedItem(dress, booking, booking.customerName ? t("alert.bookName", { name: booking.customerName }) : t("alert.bookTomorrow")),
      );
    }

    const needsPrepWork =
      dress.status === "reserved" &&
      pickup >= today &&
      (dressNeedsAlteration(dress, [booking]) || booking.needsFitting);
    if (needsPrepWork && !seenPrep.has(dress.id)) {
      seenPrep.add(dress.id);
      const when =
        pickup === today ? t("alert.prepToday") : pickup === tomorrow ? t("alert.prepTomorrow") : t("alert.prepBefore", { date: formatDate(pickup) });
      prepItems.push(namedItem(dress, booking, when));
    }
  }

  const alerts = [
    buildAlert(
      "return-overdue",
      overdueItems,
      "red",
      "overdue",
      overdueItems[0] ? `${overdueItems[0].note}${overdueItems[0].customerName ? ` — ${overdueItems[0].customerName}` : ""}` : "",
    ),
    buildAlert("return-today", returnTodayItems, "red", "returnToday", returnTodayItems[0]?.note),
    buildAlert("cleaning", cleaningItems, "red", "clean", t("alert.clean.detail")),
    buildAlert("pickup-today", pickupTodayItems, "yellow", "pickup", pickupTodayItems[0]?.note),
    buildAlert("prep", prepItems, "wine", "prep", prepItems[0]?.note),
    buildAlert(
      "booking-tomorrow",
      tomorrowItems,
      "blue",
      "tomorrow",
      tomorrowItems[0] ? (tomorrowItems[0].customerName ? t("alert.forName", { name: tomorrowItems[0].customerName }) : t("alert.pickupTomorrow")) : "",
      tomorrowItems.length === 1 ? t("alert.tomorrowNamed", { name: tomorrowItems[0].dressName }) : undefined,
    ),
  ];

  return alerts.filter((alert): alert is DailyAlert => alert !== null);
}

export function dailyAlertTotal(alerts: DailyAlert[]): number {
  return alerts.reduce((sum, alert) => sum + alert.items.length, 0);
}
