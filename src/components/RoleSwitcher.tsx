"use client";

import { Crown, UserRound } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { cn } from "@/lib/format";
import type { UserRole } from "@/types";

const ROLES: Array<{ id: UserRole; label: string; icon: typeof Crown }> = [
  { id: "owner", label: "المالك", icon: Crown },
  { id: "employee", label: "الموظف", icon: UserRound },
];

export function RoleSwitcher() {
  const { role, setRole } = useShop();

  return (
    <div
      className="inline-flex rounded-xl bg-[var(--salla-soft)] p-1 ring-1 ring-[var(--salla-border)]"
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
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--salla-primary)] text-white shadow-sm"
                : "text-[var(--foreground)] hover:bg-[var(--salla-surface)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
