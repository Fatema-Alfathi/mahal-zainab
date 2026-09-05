"use client";

import { sizeLabel, styleFamilySummary } from "@/lib/dressCatalog";
import type { Dress, DressStatus } from "@/types";

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  rented: "مؤجَّر",
  maintenance: "صيانة",
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
    <div className="shop-soft rounded-2xl px-3 py-3">
      <p className="text-xs text-rose-400">نفس هذا التصميم</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-rose-400">العدد</dt>
          <dd className="mt-0.5 text-rose-900">{summary.countLabel}</dd>
        </div>
        <div>
          <dt className="text-rose-400">المقاس</dt>
          <dd className="mt-0.5 text-rose-900">{summary.sizeLine}</dd>
        </div>
        <div>
          <dt className="text-rose-400">اللون</dt>
          <dd className="mt-0.5 text-rose-900">{summary.colorLine}</dd>
        </div>
      </dl>
      {summary.siblings.length === 0 ? (
        <p className="mt-2 text-xs leading-6 text-rose-300">ما في نسخة ثانية بلون أو مقاس مختلف.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {summary.siblings.map((item) => (
            <li key={item.id}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="rounded-full bg-white px-2.5 py-1 text-xs text-rose-700 ring-1 ring-rose-100 hover:bg-rose-50"
                >
                  {item.color} · {sizeLabel(item.size)} · {STATUS_LABELS[item.status]}
                </button>
              ) : (
                <span className="inline-block rounded-full bg-white px-2.5 py-1 text-xs text-rose-700 ring-1 ring-rose-100">
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
