"use client";

import { dressColorSwatch } from "@/lib/dressColors";
import { cn } from "@/lib/format";
import type { ReactNode } from "react";

const selectClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

export function DressSelect({
  label,
  ariaLabel,
  value,
  onChange,
  children,
  swatch,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  swatch?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-[var(--salla-muted)]">{label}</span>
      <span className="relative block">
        {swatch ? (
          <span
            className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-black/10"
            style={{ background: dressColorSwatch(swatch) }}
            aria-hidden
          />
        ) : null}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
          className={cn(selectClass, swatch && "ps-9")}
        >
          {children}
        </select>
      </span>
    </label>
  );
}
