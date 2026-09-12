"use client";

import { sizeLabel, styleFamilySummary } from "@/lib/dressCatalog";
import type { Dress, DressStatus } from "@/types";

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  reserved: "محجوز",
  rented: "عند العميلة",
  maintenance: "يحتاج تنظيف",
};

export function DressVariants({
  dress,
  dresses,
  onSelect,
}: {
  dress: Dress;
  dresses: Dress[];
  onSelect?: (dress: Dress) => void;
}) {
  const summary = styleFamilySummary(dresses, dress);

  return (
    <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3 py-3">
      <p className="text-xs text-[var(--salla-muted)]">نفس هذا التصميم</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-[var(--salla-muted)]">العدد</dt>
          <dd className="mt-0.5 font-medium text-[var(--foreground)]">{summary.countLabel}</dd>
        </div>
        <div>
          <dt className="text-[var(--salla-muted)]">المقاس</dt>
          <dd className="mt-0.5 font-medium text-[var(--foreground)]">{summary.sizeLine}</dd>
        </div>
        <div>
          <dt className="text-[var(--salla-muted)]">اللون</dt>
          <dd className="mt-0.5 font-medium text-[var(--foreground)]">{summary.colorLine}</dd>
        </div>
      </dl>
      {summary.siblings.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-[var(--salla-muted)]">ما في نسخة ثانية بلون أو مقاس مختلف.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {summary.siblings.map((item) => (
            <li key={item.id}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="rounded-lg border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                >
                  {item.color} · {sizeLabel(item.size)} · {STATUS_LABELS[item.status]}
                </button>
              ) : (
                <span className="inline-block rounded-lg border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-xs text-[var(--foreground)]">
                  {item.color} · {sizeLabel(item.size)} · {STATUS_LABELS[item.status]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
