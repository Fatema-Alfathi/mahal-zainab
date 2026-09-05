"use client";

import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { DressGrid } from "@/components/DressGrid";
import { OwnerDashboard } from "@/components/OwnerDashboard";
import { useShop } from "@/context/ShopContext";

export function BoutiqueApp() {
  const { isOwner } = useShop();

  return (
    <div className="min-h-full text-[#5a3144]">
      <BoutiqueHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        {isOwner ? <OwnerDashboard /> : <DressGrid />}
      </main>
    </div>
  );
}
