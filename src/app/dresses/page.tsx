"use client";

import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { DressManager } from "@/components/DressManager";

export default function DressesPage() {
  return (
    <div className="min-h-full text-[#5a3144]">
      <BoutiqueHeader active="dresses" />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <DressManager />
      </main>
    </div>
  );
}
