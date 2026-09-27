"use client";

import { useRef, useState } from "react";
import { Download, FileDown, Upload } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { monthYearLabel, startOfMonthIso, todayIso } from "@/lib/format";
import {
  backupFilename,
  buildBackupJson,
  buildMonthReportText,
  downloadTextFile,
  monthReportFilename,
  snapshotFromState,
} from "@/lib/shopBackup";

export function ShopFilesPanel() {
  const shop = useShop();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const monthKey = todayIso().slice(0, 7);
  const snapshot = snapshotFromState(shop);

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
      {notice ? <p className="mt-3 text-sm text-[var(--salla-primary)]">{notice}</p> : null}
    </section>
  );
}
