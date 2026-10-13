"use client";

import { useMemo } from "react";
import { BadgeCheck, CircleDollarSign, TrendingUp } from "lucide-react";
import { DressGallery } from "@/components/DressGallery";
import { DressVariants } from "@/components/DressVariants";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { dressDisplay } from "@/lib/dressCatalog";
import {
  capitalRecoveryPercent,
  dressAcquisitionCost,
  dressCleaningCost,
  dressNetProfit,
  dressRentalRevenue,
  dressRepairCost,
  hasBrokenEven,
} from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/format";

export function DressRoiTable() {
  const { dresses, bookings, variableExpenses } = useShop();
  const { t } = useLanguage();

  const rows = useMemo(
    () =>
      dresses.map((dress) => {
        const revenue = dressRentalRevenue(dress.id, bookings);
        const cleaning = dressCleaningCost(dress.id, variableExpenses);
        const repair = dressRepairCost(dress.id, variableExpenses);
        const landed = dressAcquisitionCost(dress);
        const net = dressNetProfit(dress, bookings, variableExpenses);
        const recovered = capitalRecoveryPercent(dress, bookings, variableExpenses);
        const brokenEven = hasBrokenEven(dress, bookings, variableExpenses);
        return { dress, revenue, cleaning, repair, landed, net, recovered, brokenEven };
      }),
    [bookings, dresses, variableExpenses],
  );

  const recoveredCount = rows.filter((row) => row.brokenEven).length;
  const totalNet = rows.reduce((sum, row) => sum + row.net, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <section>
      <div className="mb-5">
        <p className="text-sm text-[var(--salla-muted)]">{t("roi.kicker")}</p>
        <h3 className="mt-1 text-2xl font-medium text-[var(--foreground)] sm:text-3xl">{t("roi.title")}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">{t("roi.lead")}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="فساتين رجّعت رأس المال"
          value={`${recoveredCount} / ${rows.length}`}
          icon={BadgeCheck}
          tone="success"
        />
        <SummaryCard
          label="إجمالي دخل التأجير"
          value={formatCurrency(totalRevenue)}
          icon={CircleDollarSign}
          tone="primary"
        />
        <SummaryCard
          label="صافي بعد التكاليف"
          value={totalNet >= 0 ? formatCurrency(totalNet) : `−${formatCurrency(Math.abs(totalNet))}`}
          icon={TrendingUp}
          tone={totalNet >= 0 ? "success" : "danger"}
        />
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ dress, revenue, cleaning, repair, landed, net, recovered, brokenEven }) => {
          const barWidth = Math.max(0, Math.min(100, recovered));
          const presentation = dressDisplay(dress);
          return (
            <article key={dress.id} className="dash-panel flex flex-col overflow-hidden rounded-2xl">
              <DressGallery
                images={presentation.images}
                alt={dress.name}
                fallbackClassName={presentation.palette}
                heightClass="h-44 sm:h-48"
              />
              <div className="border-b border-[var(--salla-border)] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold leading-snug text-[var(--foreground)]">{dress.name}</h4>
                    {brokenEven ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--salla-success)]">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                        رجّع سعره وصار يربح
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--salla-muted)]">لسه ما رجّع سعر الشراء</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-[var(--salla-muted)]">صافي</p>
                    <p
                      className={cn(
                        "mt-0.5 text-lg font-semibold tabular-nums",
                        net >= 0 ? "text-[var(--salla-success)]" : "text-[var(--salla-danger)]",
                      )}
                    >
                      {net >= 0 ? formatCurrency(net) : `−${formatCurrency(Math.abs(net))}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <DressVariants dress={dress} dresses={dresses} />
                <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--salla-soft)] px-3 py-2">
                    <dt className="text-[11px] text-[var(--salla-muted)]">{t("roi.cost")}</dt>
                    <dd className="mt-0.5 tabular-nums text-[var(--foreground)]">{formatCurrency(landed)}</dd>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/40">
                    <dt className="text-[11px] text-amber-700 dark:text-amber-300">{t("roi.earned")}</dt>
                    <dd className="mt-0.5 tabular-nums text-amber-900 dark:text-amber-200">{formatCurrency(revenue)}</dd>
                  </div>
                  <div className="rounded-xl bg-yellow-50 px-3 py-2 dark:bg-yellow-950/40">
                    <dt className="text-[11px] text-yellow-700 dark:text-yellow-300">{t("roi.cleaning")}</dt>
                    <dd className="mt-0.5 tabular-nums text-yellow-900 dark:text-yellow-200">{formatCurrency(cleaning)}</dd>
                  </div>
                  <div className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-950/40">
                    <dt className="text-[11px] text-red-700 dark:text-red-300">{t("roi.repair")}</dt>
                    <dd className="mt-0.5 tabular-nums text-red-900 dark:text-red-200">{formatCurrency(repair)}</dd>
                  </div>
                </dl>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-[var(--salla-muted)]">
                      {brokenEven ? t("roi.brokeEven") : t("roi.recovered")}
                    </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        brokenEven ? "text-[var(--salla-success)]" : "text-[var(--salla-primary)]",
                      )}
                    >
                      {t("disc.percentValue", { value: Math.round(barWidth) })}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--salla-soft)]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        brokenEven ? "bg-[var(--salla-success)]" : "bg-[var(--salla-primary)]",
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof BadgeCheck;
  tone: "success" | "primary" | "danger";
}) {
  return (
    <div className="dash-panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--salla-muted)]">{label}</p>
          <p
            className={cn(
              "mt-2 text-xl font-semibold tabular-nums tracking-tight",
              tone === "success" && "text-[var(--salla-success)]",
              tone === "primary" && "text-[var(--salla-primary)]",
              tone === "danger" && "text-[var(--salla-danger)]",
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tone === "success" && "bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] text-[var(--salla-success)]",
            tone === "primary" && "bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-[var(--salla-primary)]",
            tone === "danger" && "bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] text-[var(--salla-danger)]",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "default" | "primary" | "danger";
}) {
  return (
    <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3 py-2.5">
      <dt className="text-[11px] text-[var(--salla-muted)]">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-semibold tabular-nums text-[var(--foreground)]",
          accent === "primary" && "text-[var(--salla-primary)]",
          accent === "danger" && "text-[var(--salla-danger)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
