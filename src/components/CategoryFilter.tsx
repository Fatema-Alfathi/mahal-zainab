"use client";

import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/format";
import { DRESS_CATEGORIES, type DressCategory } from "@/types";

export type CategoryFilterValue = "all" | DressCategory;

export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}) {
  return (
    <FilterGroup label="التصنيف" ariaLabel="تصفية حسب التصنيف">
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        الكل
      </Chip>
      {DRESS_CATEGORIES.map((category) => (
        <Chip key={category} active={value === category} onClick={() => onChange(category)}>
          {DRESS_CATEGORY_LABELS[category]}
        </Chip>
      ))}
    </FilterGroup>
  );
}

export function FilterGroup({
  label,
  ariaLabel,
  children,
}: {
  label: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={ariaLabel}>
      <p className="mb-2 text-xs font-medium text-[var(--salla-muted)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
        active
          ? "bg-[var(--salla-primary)] text-white dark:text-[#1d1e20]"
          : "bg-[var(--salla-soft)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--salla-primary)_10%,var(--salla-soft))]",
        className,
      )}
    >
      {children}
    </button>
  );
}
