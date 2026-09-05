"use client";

import { useState } from "react";
import { cn } from "@/lib/format";

export function DressPhoto({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return <div className={cn("h-full w-full bg-gradient-to-br", fallbackClassName)} aria-hidden />;
  }

  return (
    // External catalog photos from Unsplash/Pexels; static export uses a plain img.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      className={cn("h-full w-full object-cover object-top", className)}
    />
  );
}
