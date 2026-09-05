"use client";

import { barcodeModules } from "@/lib/barcode";
import { cn } from "@/lib/format";

export function DressBarcode({
  value,
  height = 44,
  moduleWidth = 1.15,
  className,
}: {
  value: string;
  height?: number;
  moduleWidth?: number;
  className?: string;
}) {
  const modules = barcodeModules(value);
  const quiet = 10;
  const width = (modules.length + quiet * 2) * moduleWidth;

  return (
    <figure dir="ltr" className={cn("flex flex-col items-center gap-1", className)}>
      <svg
        role="img"
        aria-label={`باركود ${value}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full rounded-md bg-white"
      >
        {modules.split("").map((bit, index) =>
          bit === "1" ? (
            <rect
              key={index}
              x={(index + quiet) * moduleWidth}
              y={0}
              width={moduleWidth}
              height={height}
              fill="#1c1917"
            />
          ) : null,
        )}
      </svg>
      <figcaption className="font-mono text-[11px] tracking-[0.18em] text-rose-400">{value}</figcaption>
    </figure>
  );
}
