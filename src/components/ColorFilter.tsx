"use client";

import { DRESS_COLORS, type DressColor } from "@/types";
import { cn } from "@/lib/format";

export type ColorFilterValue = "all" | DressColor;

export function ColorFilter({
  value,
  onChange,
}: {
  value: ColorFilterValue;
  onChange: (value: ColorFilterValue) => void;
}) {
  return (
    <div role="group" aria-label="تصفية حسب اللون">
      <p className="mb-2 text-xs font-medium text-rose-700">اللون</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            value === "all" ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
          )}
        >
          كل الألوان
        </button>
        {DRESS_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              value === color ? "shop-btn" : "bg-white font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50",
            )}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
