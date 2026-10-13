"use client";

import { AppShell } from "@/components/AppShell";
import { CustomerManager } from "@/components/CustomerManager";

export default function CustomersPage() {
  return (
    <AppShell active="customers">
      <CustomerManager />
    </AppShell>
  );
}
