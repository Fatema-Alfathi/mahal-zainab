"use client";

import type { ReactNode } from "react";
import { ShopProvider } from "@/context/ShopContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ShopProvider>{children}</ShopProvider>
    </ThemeProvider>
  );
}
