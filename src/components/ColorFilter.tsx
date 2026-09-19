"use client";

import { Chip, FilterGroup } from "@/components/CategoryFilter";
import { colorLabel } from "@/lib/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DRESS_COLORS, type DressColor } from "@/types";

export type ColorFilterValue = "all" | DressColor;

export function ColorFilter({
  value,
  onChange,
}: {
  value: ColorFilterValue;
  onChange: (value: ColorFilterValue) => void;
}) {
  const { t } = useLanguage();
  return (
    <FilterGroup label={t("filter.color")} ariaLabel={t("filter.colorAria")}>
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        {t("filter.allColors")}
      </Chip>
      {DRESS_COLORS.map((color) => (
        <Chip key={color} active={value === color} onClick={() => onChange(color)}>
          {colorLabel(color)}
        </Chip>
      ))}
    </FilterGroup>
  );
}
