"use client";

import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/format";
import { DRESS_CATEGORIES, type DressCategory } from "@/types";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: DressCategory;
  onChange: (value: DressCategory) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-rose-700">التصنيف</legend>
      <div className="flex flex-wrap gap-2">
        {DRESS_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              value === category ? "shop-btn" : "bg-rose-50 text-rose-500 hover:bg-rose-100",
            )}
          >
            {DRESS_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
