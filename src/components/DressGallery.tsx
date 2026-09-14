"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DressPhoto } from "@/components/DressPhoto";
import { cn } from "@/lib/format";

export function DressGallery({
  images,
  alt,
  fallbackClassName,
  className,
  heightClass = "h-56",
}: {
  images: string[];
  alt: string;
  fallbackClassName?: string;
  className?: string;
  heightClass?: string;
}) {
  const { t, dir } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];
  const count = slides.length;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const goTo = useCallback(
    (next: number) => {
      const clamped = (next + count) % count;
      const scroller = scrollerRef.current;
      const slide = scroller?.children[clamped] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setIndex(clamped);
    },
    [count],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function syncIndex() {
      if (!scroller) return;
      const width = scroller.clientWidth || 1;
      setIndex(Math.round(scroller.scrollLeft / width));
    }

    scroller.addEventListener("scroll", syncIndex, { passive: true });
    return () => scroller.removeEventListener("scroll", syncIndex);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={scrollerRef}
        dir="ltr"
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          heightClass,
        )}
      >
        {slides.map((src, slideIndex) => (
          <div key={`${src}-${slideIndex}`} className="h-full w-full shrink-0 snap-center">
            <DressPhoto src={src} alt={t("gallery.alt", { name: alt, n: slideIndex + 1 })} fallbackClassName={fallbackClassName} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-950/70 via-rose-900/10 to-transparent" />
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute start-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm hover:bg-white"
            aria-label={t("gallery.prev")}
          >
            <PrevIcon className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm hover:bg-white"
            aria-label={t("gallery.next")}
          >
            <NextIcon className="h-4 w-4" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5" dir="ltr">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => goTo(dotIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
                aria-label={t("gallery.photoOf", { n: dotIndex + 1, count })}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
