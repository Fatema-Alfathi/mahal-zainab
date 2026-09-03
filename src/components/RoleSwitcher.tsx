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
    <div className="inline-flex rounded-2xl bg-[#e8e2db]/80 p-1" role="tablist" aria-label="تبديل دور المستخدم">
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
              active ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{item.label}</span>
            <span className="hidden text-xs text-stone-400 sm:inline">{item.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
