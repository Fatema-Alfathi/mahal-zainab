"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileDown, Upload } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate, monthYearLabel, startOfMonthIso, todayIso } from "@/lib/format";
import {
  backupFilename,
  buildBackupJson,
  buildMonthReportText,
  downloadTextFile,
  monthReportFilename,
  snapshotFromState,
} from "@/lib/shopBackup";

type DailyBackup = {
  date: string;
  dresses: number;
  customers: number;
  bookings: number;
};

export function ShopFilesPanel() {
  const shop = useShop();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const [backups, setBackups] = useState<DailyBackup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [busyDate, setBusyDate] = useState("");
  const monthKey = todayIso().slice(0, 7);
  const snapshot = snapshotFromState(shop);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/shop/backups/");
        if (!res.ok) return;
        const body = (await res.json()) as { backups?: DailyBackup[] };
        if (!cancelled) setBackups(body.backups ?? []);
      } finally {
        if (!cancelled) setLoadingBackups(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [notice]);

  function downloadBackup() {
    downloadTextFile(backupFilename(), buildBackupJson(snapshot), "application/json;charset=utf-8");
    setNotice(t("files.backupOk"));
  }

  function downloadReport() {
    downloadTextFile(monthReportFilename(monthKey), buildMonthReportText(monthKey, snapshot));
    setNotice(t("files.reportOk", { month: monthYearLabel(startOfMonthIso(`${monthKey}-01`)) }));
  }

  async function restoreFromFile(file: File) {
    if (!window.confirm(t("files.restoreAsk"))) return;
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setNotice(t("files.restoreBad"));
      return;
    }
    if (!shop.restoreShop(parsed)) {
      setNotice(t("files.restoreBad"));
      return;
    }
    setNotice(t("files.restoreOk"));
  }

  async function restoreDay(date: string) {
    if (!window.confirm(t("files.dailyAsk", { date: formatDate(date) }))) return;
    setBusyDate(date);
    const ok = await shop.restoreDailyBackup(date);
    setBusyDate("");
    setNotice(ok ? t("files.dailyOk", { date: formatDate(date) }) : t("files.dailyFail"));
  }

  return (
    <section className="dash-panel rounded-3xl p-5">
      <div className="mb-4">
        <p className="text-xs font-medium text-[var(--salla-muted)]">{t("files.kicker")}</p>
        <h2 className="mt-1 text-lg text-[var(--foreground)]">{t("files.title")}</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--salla-muted)]">{t("files.lead")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={downloadBackup} className="shop-btn inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm">
          <Download className="h-4 w-4" aria-hidden />
          {t("files.backup")}
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
        >
          <Upload className="h-4 w-4" aria-hidden />
          {t("files.restore")}
        </button>
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          {t("files.reportThis")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void restoreFromFile(file);
          }}
        />
      </div>
      <div className="mt-4 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("files.dailyTitle")}</h3>
        {loadingBackups ? <p className="mt-2 text-xs text-[var(--salla-muted)]">{t("files.dailyLoading")}</p> : null}
        {!loadingBackups && backups.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--salla-muted)]">{t("files.dailyEmpty")}</p>
        ) : null}
        {backups.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {backups.map((backup) => (
              <li key={backup.date} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{formatDate(backup.date)}</p>
                  <p className="text-xs text-[var(--salla-muted)]">
                    {t("files.dailyItem", {
                      dresses: backup.dresses,
                      customers: backup.customers,
                      bookings: backup.bookings,
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyDate === backup.date}
                  onClick={() => void restoreDay(backup.date)}
                  className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] disabled:opacity-60"
                >
                  {t("files.dailyRestore")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {notice ? <p className="mt-3 text-sm text-[var(--salla-primary)]">{notice}</p> : null}
    </section>
  );
}
