"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";
import { ShopProvider } from "@/context/ShopContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ShopProvider>
      <AuthGate>{children}</AuthGate>
    </ShopProvider>
  );
}
