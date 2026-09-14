import { dressNeedsAlteration } from "@/lib/dressCatalog";
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
    items.map((item) => (item.customerName ? `${item.dressName} لـ ${item.customerName}` : item.dressName)),
  );
}

function dressesCountPhrase(
  count: number,
  named: string | undefined,
  forms: { one: string; two: string; few: string; many: string },
): string {
  if (count === 1 && named) return `${named} ${forms.one}`;
  if (count === 1) return `فستان ${forms.one}`;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

function alertsCountLabel(count: number): string {
  if (count === 0) return "ما في تنبيهات";
  if (count === 1) return "تنبيه واحد";
  if (count === 2) return "تنبيهان";
  if (count >= 3 && count <= 10) return `${count} تنبيهات`;
  return `${count} تنبيه`;
}

export function dailyAlertCountLabel(count: number): string {
  return alertsCountLabel(count);
}

function buildAlert(
  kind: DailyAlertKind,
  items: DailyAlertItem[],
  tone: DailyAlertTone,
  forms: { one: string; two: string; few: string; many: string },
  detailForOne?: string,
  title?: string,
): DailyAlert | null {
  if (items.length === 0) return null;
  const named = items.length === 1 ? items[0].dressName : undefined;
  return {
    id: kind,
    kind,
    title: title ?? dressesCountPhrase(items.length, named, forms),
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
      overdueItems.push(namedItem(dress, booking, `كان الإرجاع ${formatDate(due)}`));
    } else if (due === today) {
      returnTodayItems.push(namedItem(dress, booking, booking.customerName ? `من ${booking.customerName}` : "موعد الإرجاع اليوم"));
    }

    if (pickup === today && dress.status !== "rented") {
      pickupTodayItems.push(
        namedItem(dress, booking, booking.customerName ? `تسليم لـ ${booking.customerName}` : "يُسلَّم اليوم"),
      );
    }

    if (pickup === tomorrow) {
      tomorrowItems.push(
        namedItem(dress, booking, booking.customerName ? `حجز ${booking.customerName}` : "الحجز باكر"),
      );
    }

    const needsPrepWork =
      dress.status === "reserved" &&
      pickup >= today &&
      (dressNeedsAlteration(dress, [booking]) || booking.needsFitting);
    if (needsPrepWork && !seenPrep.has(dress.id)) {
      seenPrep.add(dress.id);
      const when = pickup === today ? "للاستلام اليوم" : pickup === tomorrow ? "قبل حجز الغد" : `قبل الاستلام ${formatDate(pickup)}`;
      prepItems.push(namedItem(dress, booking, when));
    }
  }

  const alerts = [
    buildAlert(
      "return-overdue",
      overdueItems,
      "red",
      {
        one: "متأخر عن الإرجاع",
        two: "فستانان متأخران عن الإرجاع",
        few: "فساتين متأخرات عن الإرجاع",
        many: "فستان متأخر عن الإرجاع",
      },
      overdueItems[0] ? `${overdueItems[0].note}${overdueItems[0].customerName ? ` — ${overdueItems[0].customerName}` : ""}` : "",
    ),
    buildAlert(
      "return-today",
      returnTodayItems,
      "red",
      {
        one: "موعد إرجاعه اليوم",
        two: "فستانان موعد إرجاعهما اليوم",
        few: "فساتين موعد إرجاعهن اليوم",
        many: "فستان موعد إرجاعه اليوم",
      },
      returnTodayItems[0]?.note,
    ),
    buildAlert(
      "cleaning",
      cleaningItems,
      "red",
      {
        one: "يحتاج غسيل",
        two: "فستانان يحتاجان غسيل",
        few: "فساتين يحتاجن غسيل",
        many: "فستان يحتاج غسيل",
      },
      "رجّعيه للبوتيك بعد الغسيل",
    ),
    buildAlert(
      "pickup-today",
      pickupTodayItems,
      "yellow",
      {
        one: "يُسلَّم اليوم",
        two: "فستانان يُسلَّمان اليوم",
        few: "فساتين تُسلَّم اليوم",
        many: "فستان يُسلَّم اليوم",
      },
      pickupTodayItems[0]?.note,
    ),
    buildAlert(
      "prep",
      prepItems,
      "wine",
      {
        one: "يحتاج تجهيز",
        two: "فستانان يحتاجان تجهيز",
        few: "فساتين يحتاجن تجهيز",
        many: "فستان يحتاج تجهيز",
      },
      prepItems[0]?.note,
    ),
    buildAlert(
      "booking-tomorrow",
      tomorrowItems,
      "blue",
      {
        one: "حجز الغد",
        two: "حجزان باكر",
        few: "حجوزات باكر",
        many: "حجز باكر",
      },
      tomorrowItems[0] ? (tomorrowItems[0].customerName ? `لـ ${tomorrowItems[0].customerName}` : "الاستلام باكر") : "",
      tomorrowItems.length === 1 ? `حجز الغد: ${tomorrowItems[0].dressName}` : undefined,
    ),
  ];

  return alerts.filter((alert): alert is DailyAlert => alert !== null);
}

export function dailyAlertTotal(alerts: DailyAlert[]): number {
  return alerts.reduce((sum, alert) => sum + alert.items.length, 0);
}
