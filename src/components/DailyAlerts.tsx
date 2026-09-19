"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BellRing, CalendarDays, HandHeart, RotateCcw, Shirt, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { dailyAlertCountLabel, dailyAlerts, dailyAlertTotal, type DailyAlert, type DailyAlertKind } from "@/lib/dailyAlerts";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";

const KIND_ICON: Record<DailyAlertKind, typeof BellRing> = {
  "return-overdue": RotateCcw,
  "return-today": RotateCcw,
  cleaning: Sparkles,
  "pickup-today": HandHeart,
  prep: Shirt,
  "booking-tomorrow": CalendarDays,
};

export function DailyAlerts({ compact = false }: { compact?: boolean }) {
  const { dresses, bookings } = useShop();
  const { t, locale } = useLanguage();
  const alerts = useMemo(() => dailyAlerts(dresses, bookings), [bookings, dresses, locale]);
  const total = dailyAlertTotal(alerts);

  return (
    <section className={cn("dash-panel rounded-3xl p-5", compact && "p-4")} aria-label={t("alerts.aria")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--salla-muted)]">{t("alerts.kicker")}</p>
          <h2 className="mt-1 text-lg text-[var(--foreground)]">{t("alerts.title")}</h2>
          <p className="mt-1 text-xs text-[var(--salla-muted)]">{t("alerts.lead")}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            total > 0 ? "bg-red-600 text-white" : "bg-emerald-600 text-white",
          )}
        >
          {dailyAlertCountLabel(total)}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{t("alerts.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertRow({ alert }: { alert: DailyAlert }) {
  const Icon = KIND_ICON[alert.kind];
  const single = alert.items.length === 1 ? alert.items[0] : null;
  const toneClass =
    alert.tone === "red"
      ? "shop-tint-red"
      : alert.tone === "yellow"
        ? "shop-tint-yellow"
        : alert.tone === "blue"
          ? "shop-tint-blue"
          : "bg-[color-mix(in_srgb,var(--salla-primary)_12%,var(--salla-surface))] ring-1 ring-[color-mix(in_srgb,#8b1530_35%,transparent)]";

  const content = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
          alert.tone === "red" && "bg-red-600 text-white",
          alert.tone === "yellow" && "bg-yellow-400 text-yellow-950",
          alert.tone === "blue" && "bg-sky-600 text-white",
          alert.tone === "wine" && "bg-[#8b1530] text-white",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{alert.title}</p>
        {single && alert.detail ? <p className="mt-0.5 text-xs leading-5 text-[var(--salla-muted)]">{alert.detail}</p> : null}
        {alert.items.length > 1 ? (
          <ul className="mt-2 space-y-1">
            {alert.items.map((item) => (
              <li key={`${alert.id}-${item.dressId}`}>
                <Link
                  href={`/calendar/?dress=${item.dressId}`}
                  className="text-xs text-[var(--salla-primary)] hover:underline"
                >
                  {item.customerName ? `${item.dressName} — ${item.customerName}` : item.dressName}
                  {item.note ? ` · ${item.note}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );

  if (single) {
    return (
      <li>
        <Link href={`/calendar/?dress=${single.dressId}`} className={cn("block rounded-2xl px-3 py-3", toneClass)}>
          {content}
        </Link>
      </li>
    );
  }

  return <li className={cn("rounded-2xl px-3 py-3", toneClass)}>{content}</li>;
}
