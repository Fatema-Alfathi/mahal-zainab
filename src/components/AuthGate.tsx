"use client";

import type { ReactNode } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { useShop } from "@/context/ShopContext";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authReady, signedIn } = useShop();

  if (!authReady) {
    return (
      <div className="flex min-h-full items-center justify-center px-5 py-12">
        <p className="text-sm text-rose-400">تحميل…</p>
      </div>
    );
  }

  if (!signedIn) return <LoginScreen />;
  return children;
}
