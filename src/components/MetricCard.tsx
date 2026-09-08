"use client";

import type { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/format";

interface MetricCardProps {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone?: "neutral" | "profit" | "loss" | "rose";
}

export function MetricCard({ label, value, hint, icon: Icon, tone = "neutral" }: MetricCardProps) {
  const positive = value >= 0;

  return (
    <article className="shop-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-rose-400">{label}</p>
          <p
            className={cn(
              "mt-3 text-3xl font-medium tabular-nums tracking-tight",
              tone === "profit" && "text-teal-800",
              tone === "loss" && "text-rose-700",
              (tone === "neutral" || tone === "rose") && "text-rose-900",
            )}
          >
            {tone === "profit" || tone === "loss"
              ? `${positive ? "" : "−"}${formatCurrency(Math.abs(value))}`
              : formatCurrency(value)}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-rose-400">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </article>
  );
}
