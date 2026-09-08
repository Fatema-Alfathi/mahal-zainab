"use client";

import { DRESS_SIZES, type DressSize } from "@/types";
import { cn } from "@/lib/format";

export type SizeFilterValue = "all" | DressSize;

export function SizeFilter({
  value,
  onChange,
}: {
  value: SizeFilterValue;
  onChange: (value: SizeFilterValue) => void;
}) {
  return (
    <div role="group" aria-label="تصفية حسب المقاس">
      <p className="mb-2 text-xs font-medium text-rose-700">المقاس</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            value === "all" ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
          )}
        >
          كل المقاسات
        </button>
        {DRESS_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm tabular-nums",
              value === size ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
