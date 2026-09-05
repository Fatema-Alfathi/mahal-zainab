"use client";

import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
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
  return (
    <div role="group" aria-label="تصفية حسب التصنيف">
      <p className="mb-2 text-xs text-rose-400">التصنيف</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            value === "all" ? "shop-btn" : "bg-white/80 text-rose-400 hover:bg-white",
          )}
        >
          كل التصنيفات
        </button>
        {DRESS_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              value === category ? "shop-btn" : "bg-white/80 text-rose-400 hover:bg-white",
            )}
          >
            {DRESS_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  );
}
