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
    <article className="rounded-3xl bg-white/80 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p
            className={cn(
              "mt-3 text-3xl font-medium tabular-nums tracking-tight",
              tone === "profit" && "text-teal-800",
              tone === "loss" && "text-rose-700",
              (tone === "neutral" || tone === "rose") && "text-stone-800",
            )}
          >
            {tone === "profit" || tone === "loss"
              ? `${positive ? "" : "−"}${formatCurrency(Math.abs(value))}`
              : formatCurrency(value)}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-400">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f3f1ee] text-stone-500">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </article>
  );
}
