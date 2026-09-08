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
    <div className="inline-flex rounded-2xl bg-white/10 p-1 ring-1 ring-white/25" role="tablist" aria-label="تبديل دور المستخدم">
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
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors",
              active ? "shop-btn-gold shadow-sm" : "text-white hover:bg-white/10",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{item.label}</span>
            <span className="hidden text-xs text-[#ffd76a] sm:inline">{item.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
