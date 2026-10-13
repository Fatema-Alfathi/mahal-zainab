"use client";

import { DressSelect } from "@/components/DressSelect";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DRESS_SIZES, type DressSize } from "@/types";

export function SizePicker({
  value,
  onChange,
}: {
  value: DressSize;
  onChange: (value: DressSize) => void;
}) {
  const { t } = useLanguage();
  return (
    <DressSelect
      label={t("filter.size")}
      ariaLabel={t("filter.sizeAria")}
      value={value}
      onChange={(next) => onChange(next as DressSize)}
    >
      {DRESS_SIZES.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </DressSelect>
  );
}
