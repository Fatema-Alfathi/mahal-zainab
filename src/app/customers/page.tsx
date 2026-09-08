"use client";

import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { CustomerManager } from "@/components/CustomerManager";

export default function CustomersPage() {
  return (
    <div className="min-h-full text-[#2d0503]">
      <BoutiqueHeader active="customers" />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <CustomerManager />
      </main>
    </div>
  );
}
