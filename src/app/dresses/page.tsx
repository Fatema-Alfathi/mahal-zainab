"use client";

import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { DressManager } from "@/components/DressManager";

export default function DressesPage() {
  return (
    <div className="min-h-full text-[#2d0503]">
      <BoutiqueHeader active="dresses" />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <DressManager />
      </main>
    </div>
  );
}
