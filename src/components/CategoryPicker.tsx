"use client";

import { DressSelect } from "@/components/DressSelect";
import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DRESS_CATEGORIES, type DressCategory } from "@/types";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: DressCategory;
  onChange: (value: DressCategory) => void;
}) {
  const { t } = useLanguage();
  return (
    <DressSelect
      label={t("filter.category")}
      ariaLabel={t("filter.categoryAria")}
      value={value}
      onChange={(next) => onChange(next as DressCategory)}
    >
      {DRESS_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {DRESS_CATEGORY_LABELS[category]}
        </option>
      ))}
    </DressSelect>
  );
}
