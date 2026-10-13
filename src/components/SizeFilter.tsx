"use client";

import { DressSelect } from "@/components/DressSelect";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DRESS_SIZES, type DressSize } from "@/types";

export type SizeFilterValue = "all" | DressSize;

export function SizeFilter({
  value,
  onChange,
}: {
  value: SizeFilterValue;
  onChange: (value: SizeFilterValue) => void;
}) {
  const { t } = useLanguage();
  return (
    <DressSelect
      label={t("filter.size")}
      ariaLabel={t("filter.sizeAria")}
      value={value}
      onChange={(next) => onChange(next as SizeFilterValue)}
    >
      <option value="all">{t("filter.allSizes")}</option>
      {DRESS_SIZES.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </DressSelect>
  );
}
