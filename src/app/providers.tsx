"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";
import { ShopProvider } from "@/context/ShopContext";
import { LanguageProvider } from "@/i18n/LanguageProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ShopProvider>
        <AuthGate>{children}</AuthGate>
      </ShopProvider>
    </LanguageProvider>
  );
}
