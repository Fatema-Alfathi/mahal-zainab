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
      <p className="mb-2 text-xs text-rose-400">اللون</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            value === "all" ? "shop-btn" : "bg-white/80 text-rose-400 hover:bg-white",
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
              value === color ? "shop-btn" : "bg-white/80 text-rose-400 hover:bg-white",
            )}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
