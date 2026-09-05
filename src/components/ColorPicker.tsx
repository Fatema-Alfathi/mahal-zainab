"use client";

import { DRESS_COLORS, type DressColor } from "@/types";
import { cn } from "@/lib/format";

export function ColorPicker({
  value,
  onChange,
}: {
  value: DressColor;
  onChange: (value: DressColor) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-rose-700">اللون</legend>
      <div className="flex flex-wrap gap-2">
        {DRESS_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              value === color ? "shop-btn" : "bg-rose-50 text-rose-500 hover:bg-rose-100",
            )}
          >
            {color}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
