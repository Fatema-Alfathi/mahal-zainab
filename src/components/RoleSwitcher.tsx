"use client";

import { Crown, UserRound } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { cn } from "@/lib/format";
import type { UserRole } from "@/types";

const ROLES: Array<{ id: UserRole; label: string; hint: string; icon: typeof Crown }> = [
  { id: "owner", label: "المالك", hint: "الحسابات", icon: Crown },
  { id: "employee", label: "الموظف", hint: "التشغيل", icon: UserRound },
];

export function RoleSwitcher() {
  const { role, setRole } = useShop();

  return (
    <div
      className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200"
      role="tablist"
      aria-label="تبديل دور المستخدم"
    >
      {ROLES.map((item) => {
        const Icon = item.icon;
        const active = role === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setRole(item.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-[var(--salla-primary)] text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-[var(--salla-primary)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{item.label}</span>
            <span className={cn("hidden text-xs sm:inline", active ? "text-white/80" : "text-slate-400")}>
              {item.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
