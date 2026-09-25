import { assetPath } from "@/lib/assetPath";
import { cn } from "@/lib/format";

export function BrandLogo({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    // Static export on GitHub Pages needs the repo base path; next/image was skipping it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/yal-logo.jpg")}
      alt="YAL"
      width={size === "md" ? 88 : 56}
      height={size === "md" ? 88 : 56}
      className={cn(
        "rounded-xl object-cover ring-1 ring-[#d4b896]",
        size === "md" ? "h-[5.5rem] w-[5.5rem]" : "h-11 w-11",
        className,
      )}
    />
  );
}
