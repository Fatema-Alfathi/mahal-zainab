"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { sizeLabel, styleFamilySummary } from "@/lib/dressCatalog";
import { colorLabel, dressStatusLabel } from "@/lib/labels";
import type { Dress } from "@/types";

export function DressVariants({
  dress,
  dresses,
  onSelect,
}: {
  dress: Dress;
  dresses: Dress[];
  onSelect?: (dress: Dress) => void;
}) {
  const { t } = useLanguage();
  const summary = styleFamilySummary(dresses, dress);

  return (
    <div className="shop-soft rounded-2xl px-3 py-3">
      <p className="text-xs text-[var(--salla-muted)]">{t("variants.title")}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-[var(--salla-muted)]">{t("variants.count")}</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{summary.countLabel}</dd>
        </div>
        <div>
          <dt className="text-[var(--salla-muted)]">{t("variants.size")}</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{summary.sizeLine}</dd>
        </div>
        <div>
          <dt className="text-[var(--salla-muted)]">{t("variants.color")}</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{summary.colorLine}</dd>
        </div>
      </dl>
      {summary.siblings.length === 0 ? (
        <p className="mt-2 text-xs leading-6 text-[var(--salla-muted)]">{t("variants.empty")}</p>
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
                  {colorLabel(item.color)} · {sizeLabel(item.size)} · {dressStatusLabel(item.status)}
                </button>
              ) : (
                <span className="inline-block rounded-lg border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-xs text-[var(--foreground)]">
                  {colorLabel(item.color)} · {sizeLabel(item.size)} · {dressStatusLabel(item.status)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
