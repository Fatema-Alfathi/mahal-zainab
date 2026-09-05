"use client";

import type { ReactNode } from "react";
import { ShopProvider } from "@/context/ShopContext";

export function Providers({ children }: { children: ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}
