import { t } from "@/i18n/t";
import { daysLabel } from "@/lib/labels";
import { todayIso } from "@/lib/format";
import {
  GOVERNMENT_RECORD_KINDS,
  type GovernmentRecord,
  type GovernmentRecordDraft,
  type GovernmentRecordKind,
} from "@/types";

export const GOVERNMENT_KIND_LABELS: Record<GovernmentRecordKind, string> = {
  get lease() {
    return t("gov.lease");
  },
  get register() {
    return t("gov.register");
  },
  get license() {
    return t("gov.license");
  },
  get other() {
    return t("gov.other");
  },
};

export const GOVERNMENT_SOON_DAYS = 30;

export type GovernmentRecordStatus = "overdue" | "today" | "soon" | "ok";

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function signedDayDiff(from: string, to: string): number {
  const start = parseIso(from).getTime();
  const end = parseIso(to).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function isGovernmentRecordKind(value: string): value is GovernmentRecordKind {
  return (GOVERNMENT_RECORD_KINDS as readonly string[]).includes(value);
}

export function normalizeGovernmentRecordDraft(draft: GovernmentRecordDraft): GovernmentRecordDraft | null {
  const name = draft.name.trim();
  const notes = draft.notes.trim();
  const renewalDate = draft.renewalDate.trim();
  const kind = isGovernmentRecordKind(draft.kind) ? draft.kind : "other";
  if (!name) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) return null;
  return { kind, name, renewalDate, notes };
}

export function governmentRecordStatus(renewalDate: string, today = todayIso()): GovernmentRecordStatus {
  const days = signedDayDiff(today, renewalDate);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= GOVERNMENT_SOON_DAYS) return "soon";
  return "ok";
}

export function governmentRecordCountdown(renewalDate: string, today = todayIso()): string {
  const days = signedDayDiff(today, renewalDate);
  if (days < 0) return t("gov.late", { days: daysLabel(Math.abs(days)) });
  if (days === 0) return t("gov.today");
  return t("gov.left", { days: daysLabel(days) });
}

export function sortGovernmentRecords(records: GovernmentRecord[]): GovernmentRecord[] {
  return [...records].sort((left, right) => {
    const byDate = left.renewalDate.localeCompare(right.renewalDate);
    if (byDate !== 0) return byDate;
    return left.name.localeCompare(right.name, "ar");
  });
}

export function governmentRecordSummary(records: GovernmentRecord[], today = todayIso()) {
  const overdue = records.filter((item) => governmentRecordStatus(item.renewalDate, today) === "overdue").length;
  const todayCount = records.filter((item) => governmentRecordStatus(item.renewalDate, today) === "today").length;
  const soon = records.filter((item) => governmentRecordStatus(item.renewalDate, today) === "soon").length;
  return { overdue, todayCount, soon, total: records.length };
}
