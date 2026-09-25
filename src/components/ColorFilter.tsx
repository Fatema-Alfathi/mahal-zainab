"use client";

import { DressSelect } from "@/components/DressSelect";
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
    <DressSelect
      label={t("filter.color")}
      ariaLabel={t("filter.colorAria")}
      value={value}
      onChange={(next) => onChange(next as ColorFilterValue)}
      swatch={value === "all" ? undefined : value}
    >
      <option value="all">{t("filter.allColors")}</option>
      {DRESS_COLORS.map((color) => (
        <option key={color} value={color}>
          {colorLabel(color)}
        </option>
      ))}
    </DressSelect>
  );
}
