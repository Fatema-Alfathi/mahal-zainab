"use client";

import { whatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/format";

export function WhatsAppLink({
  phone,
  text,
  children,
  className,
}: {
  phone: string;
  text: string;
  children: React.ReactNode;
  className?: string;
}) {
  const href = whatsAppHref(phone, text);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(className)}>
      {children}
    </a>
  );
}
