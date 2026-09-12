"use client";

import { Chip, FilterGroup } from "@/components/CategoryFilter";
import { DRESS_COLORS, type DressColor } from "@/types";

export type ColorFilterValue = "all" | DressColor;

export function ColorFilter({
  value,
  onChange,
}: {
  value: ColorFilterValue;
  onChange: (value: ColorFilterValue) => void;
}) {
  return (
    <FilterGroup label="اللون" ariaLabel="تصفية حسب اللون">
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        الكل
      </Chip>
      {DRESS_COLORS.map((color) => (
        <Chip key={color} active={value === color} onClick={() => onChange(color)}>
          {color}
        </Chip>
      ))}
    </FilterGroup>
  );
}
