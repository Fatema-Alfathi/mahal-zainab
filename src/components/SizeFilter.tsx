"use client";

import { Chip, FilterGroup } from "@/components/CategoryFilter";
import { DRESS_SIZES, type DressSize } from "@/types";

export type SizeFilterValue = "all" | DressSize;

export function SizeFilter({
  value,
  onChange,
}: {
  value: SizeFilterValue;
  onChange: (value: SizeFilterValue) => void;
}) {
  return (
    <FilterGroup label="المقاس" ariaLabel="تصفية حسب المقاس">
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        الكل
      </Chip>
      {DRESS_SIZES.map((size) => (
        <Chip key={size} active={value === size} onClick={() => onChange(size)} className="tabular-nums">
          {size}
        </Chip>
      ))}
    </FilterGroup>
  );
}
