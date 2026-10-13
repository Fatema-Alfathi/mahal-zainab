"use client";

import { AppShell } from "@/components/AppShell";
import { DressGrid } from "@/components/DressGrid";
import { OwnerDashboard } from "@/components/OwnerDashboard";
import { useShop } from "@/context/ShopContext";

export function BoutiqueApp() {
  const { isOwner } = useShop();

  return <AppShell active="home">{isOwner ? <OwnerDashboard /> : <DressGrid />}</AppShell>;
}
