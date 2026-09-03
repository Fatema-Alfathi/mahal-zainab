"use client";

import { BoutiqueApp } from "@/components/BoutiqueApp";
import { ShopProvider } from "@/context/ShopContext";

export default function Home() {
  return (
    <ShopProvider>
      <BoutiqueApp />
    </ShopProvider>
  );
}
