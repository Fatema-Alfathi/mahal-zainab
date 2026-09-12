import Image from "next/image";
import { cn } from "@/lib/format";

export function BrandLogo({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "md" ? 88 : 56;
  return (
    <Image
      src="/yal-logo.jpg"
      alt="YAL"
      width={px}
      height={px}
      priority={size === "sm"}
      className={cn(
        "rounded-xl object-cover ring-1 ring-slate-200",
        size === "md" ? "h-[5.5rem] w-[5.5rem]" : "h-11 w-11",
        className,
      )}
    />
  );
}
