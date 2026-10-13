"use client";

import { AppShell } from "@/components/AppShell";
import { DressManager } from "@/components/DressManager";

export default function DressesPage() {
  return (
    <AppShell active="dresses">
      <DressManager />
    </AppShell>
  );
}
