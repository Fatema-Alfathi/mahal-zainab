"use client";

import { DressSelect } from "@/components/DressSelect";
import { colorLabel } from "@/lib/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DRESS_COLORS, type DressColor } from "@/types";

export function ColorPicker({
  value,
  onChange,
}: {
  value: DressColor;
  onChange: (value: DressColor) => void;
}) {
  const { t } = useLanguage();
  return (
    <DressSelect
      label={t("filter.color")}
      ariaLabel={t("filter.colorAria")}
      value={value}
      onChange={(next) => onChange(next as DressColor)}
      swatch={value}
    >
      {DRESS_COLORS.map((color) => (
        <option key={color} value={color}>
          {colorLabel(color)}
        </option>
      ))}
    </DressSelect>
  );
}
