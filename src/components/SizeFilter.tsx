"use client";

import { Chip, FilterGroup } from "@/components/CategoryFilter";
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
    <FilterGroup label={t("filter.size")} ariaLabel={t("filter.sizeAria")}>
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        {t("filter.allSizes")}
      </Chip>
      {DRESS_SIZES.map((size) => (
        <Chip key={size} active={value === size} onClick={() => onChange(size)} className="tabular-nums">
          {size}
        </Chip>
      ))}
    </FilterGroup>
  );
}
