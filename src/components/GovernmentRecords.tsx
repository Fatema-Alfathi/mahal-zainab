"use client";

import { FormEvent, useMemo, useState } from "react";
import { FileBadge, Pencil, Plus, Trash2, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import {
  GOVERNMENT_KIND_LABELS,
  governmentRecordCountdown,
  governmentRecordStatus,
  governmentRecordSummary,
  sortGovernmentRecords,
} from "@/lib/governmentRecords";
import { cn, formatDate } from "@/lib/format";
import { GOVERNMENT_RECORD_KINDS, type GovernmentRecord, type GovernmentRecordDraft, type GovernmentRecordKind } from "@/types";

const STATUS_STYLES = {
  overdue: "shop-tint-red",
  today: "shop-tint-yellow",
  soon: "shop-tint-yellow",
  ok: "bg-emerald-50 ring-1 ring-emerald-200",
} as const;

const STATUS_BADGE = {
  overdue: "bg-red-600 text-white",
  today: "bg-yellow-400 text-yellow-950",
  soon: "bg-yellow-400 text-yellow-950",
  ok: "bg-emerald-600 text-white",
} as const;

const EMPTY_DRAFT: GovernmentRecordDraft = {
  kind: "license",
  name: "",
  renewalDate: "",
  notes: "",
};

export function GovernmentRecords() {
  const { governmentRecords, addGovernmentRecord, updateGovernmentRecord, deleteGovernmentRecord } = useShop();
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; record: GovernmentRecord } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GovernmentRecord | null>(null);
  const rows = useMemo(() => sortGovernmentRecords(governmentRecords), [governmentRecords]);
  const summary = useMemo(() => governmentRecordSummary(governmentRecords), [governmentRecords]);

  return (
    <section className="dash-panel rounded-3xl p-5" aria-label="العقد والتراخيص">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-rose-400">أوراق المحل</p>
          <h2 className="mt-1 text-lg text-rose-900">العقد والتراخيص والسجل</h2>
          <p className="mt-1 text-xs text-rose-400">
            حطي تاريخ تجديد عقد الإيجار، السجل التجاري، والرخص الحكومية عشان ما يفوت الموعد.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: "add" })}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          تاريخ تجديد
        </button>
      </div>

      <dl className="mb-4 grid gap-2 sm:grid-cols-3">
        <SummaryChip label="متأخر" value={summary.overdue} tone="red" />
        <SummaryChip label="قرب التجديد" value={summary.soon + summary.todayCount} tone="yellow" />
        <SummaryChip label="كل الأوراق" value={summary.total} tone="wine" />
      </dl>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">ما في تواريخ بعد. أضيفي عقد أو رخصة أو سجل.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((record) => {
            const status = governmentRecordStatus(record.renewalDate);
            return (
              <li key={record.id} className={cn("rounded-2xl px-4 py-3", STATUS_STYLES[status])}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileBadge className="h-4 w-4 text-rose-700" aria-hidden />
                      <p className="text-sm font-medium text-rose-900">{record.name}</p>
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-rose-700">
                        {GOVERNMENT_KIND_LABELS[record.kind]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-rose-600">التجديد: {formatDate(record.renewalDate)}</p>
                    {record.notes ? <p className="mt-1 text-xs leading-5 text-rose-500">{record.notes}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE[status])}>
                      {governmentRecordCountdown(record.renewalDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditor({ mode: "edit", record })}
                      className="rounded-full bg-white p-1.5 text-rose-700 hover:bg-rose-50"
                      aria-label={`تعديل ${record.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(record)}
                      className="rounded-full bg-white p-1.5 text-red-600 hover:bg-red-50"
                      aria-label={`حذف ${record.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editor ? (
        <RecordForm
          title={editor.mode === "add" ? "تاريخ تجديد جديد" : `تعديل ${editor.record.name}`}
          initial={editor.mode === "add" ? EMPTY_DRAFT : editor.record}
          onClose={() => setEditor(null)}
          onSave={(draft) => {
            const ok = editor.mode === "add" ? addGovernmentRecord(draft) : updateGovernmentRecord(editor.record.id, draft);
            if (ok) setEditor(null);
            return ok;
          }}
        />
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="إلغاء الحذف" onClick={() => setPendingDelete(null)} />
          <div className="shop-card relative w-full max-w-md rounded-3xl p-6">
            <h3 className="text-xl text-rose-900">حذف {pendingDelete.name}؟</h3>
            <p className="mt-2 text-sm leading-6 text-rose-600">بيختفي تاريخ التجديد من لوحة المالك.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-800">
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGovernmentRecord(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="shop-btn-red rounded-2xl px-4 py-2 text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: "red" | "yellow" | "wine" }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-2",
        tone === "red" && "bg-red-600 text-white",
        tone === "yellow" && "bg-yellow-400 text-yellow-950",
        tone === "wine" && "bg-[#8b1530] text-white",
      )}
    >
      <dt className="text-[11px] font-medium opacity-95">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function RecordForm({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  initial: GovernmentRecordDraft;
  onSave: (draft: GovernmentRecordDraft) => boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<GovernmentRecordDraft>(initial);
  const [error, setError] = useState("");

  function applyKind(kind: GovernmentRecordKind) {
    setDraft((current) => {
      const wasDefault = !current.name.trim() || current.name === GOVERNMENT_KIND_LABELS[current.kind];
      return {
        ...current,
        kind,
        name: wasDefault ? GOVERNMENT_KIND_LABELS[kind] : current.name,
      };
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("اكتبي اسم الورقة أو العقد.");
      return;
    }
    if (!draft.renewalDate) {
      setError("اختاري تاريخ التجديد.");
      return;
    }
    if (!onSave(draft)) {
      setError("تعذر الحفظ. راجعي الاسم والتاريخ.");
      return;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div className="shop-card relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-2xl text-rose-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="mb-2 text-sm text-rose-700">النوع</p>
            <div className="flex flex-wrap gap-1.5">
              {GOVERNMENT_RECORD_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => applyKind(kind)}
                  className={
                    draft.kind === kind ? "shop-btn rounded-full px-3 py-1 text-xs" : "rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
                  }
                >
                  {GOVERNMENT_KIND_LABELS[kind]}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">الاسم</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="مثل السجل التجاري أو عقد الإيجار"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">تاريخ التجديد</span>
            <input
              type="date"
              value={draft.renewalDate}
              onChange={(event) => setDraft((current) => ({ ...current, renewalDate: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">ملاحظة</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="رقم الرخصة أو جهة التجديد، إذا تبين"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-800">
              تراجع
            </button>
            <button type="submit" className="shop-btn rounded-2xl px-4 py-2 text-sm">
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
