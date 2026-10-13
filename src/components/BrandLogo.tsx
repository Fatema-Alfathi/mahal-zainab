import { assetPath } from "@/lib/assetPath";
import { cn } from "@/lib/format";

export function BrandLogo({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension = size === "lg" ? 128 : size === "md" ? 88 : 56;
  return (
    // Static export on GitHub Pages needs the repo base path; next/image was skipping it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/yal-logo.jpg")}
      alt="YAL"
      width={dimension}
      height={dimension}
      className={cn(
        "object-cover ring-1 ring-[#d4b896]",
        size === "lg" ? "h-32 w-32 rounded-3xl" : size === "md" ? "h-[5.5rem] w-[5.5rem] rounded-xl" : "h-11 w-11 rounded-xl",
        className,
      )}
    />
  );
}
