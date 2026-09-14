"use client";

import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/format";
import { DRESS_CATEGORIES, type DressCategory } from "@/types";

export type CategoryFilterValue = "all" | DressCategory;

export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}) {
  const { t } = useLanguage();
  return (
    <div role="group" aria-label={t("filter.categoryAria")}>
      <p className="mb-2 text-xs font-medium text-rose-700">{t("filter.category")}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            value === "all" ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
          )}
        >
          {t("filter.allCategories")}
        </button>
        {DRESS_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              value === category ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
            )}
          >
            {DRESS_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  );
}
