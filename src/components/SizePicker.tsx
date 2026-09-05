"use client";

import { DRESS_SIZES, type DressSize } from "@/types";
import { cn } from "@/lib/format";

export function SizePicker({
  value,
  onChange,
}: {
  value: DressSize;
  onChange: (value: DressSize) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-rose-700">المقاس</legend>
      <div className="flex flex-wrap gap-2">
        {DRESS_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm tabular-nums",
              value === size ? "shop-btn" : "bg-rose-50 text-rose-500 hover:bg-rose-100",
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
