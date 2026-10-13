"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { DressPhoto } from "@/components/DressPhoto";
import { useLanguage } from "@/i18n/LanguageProvider";
import { uploadDressPhoto } from "@/lib/dressPhotoUpload";

const MAX_PHOTOS = 6;

export function DressPhotoField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const { t } = useLanguage();
  const deviceRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photos = images.map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url));

  async function take(file: File | undefined) {
    if (!file || busy) return;
    if (photos.length >= MAX_PHOTOS) {
      setError("dresses.photoLimit");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const url = await uploadDressPhoto(file);
      onChange([...photos, url]);
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "fail";
      setError(code === "too-big" ? "dresses.photoBig" : code === "type" ? "dresses.photoType" : "dresses.photoFail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl bg-[var(--salla-soft)]/80 px-3 py-3">
      <p className="text-sm text-[var(--foreground)]">{t("dresses.photos")}</p>
      <p className="text-xs text-[var(--salla-muted)]">{t("dresses.photoHint")}</p>
      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <li key={`${url}-${index}`} className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <DressPhoto src={url} alt={t("gallery.alt", { name: t("dresses.photos"), n: index + 1 })} />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, photoIndex) => photoIndex !== index))}
                className="absolute end-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#2a0c12] shadow-sm"
                aria-label={t("dresses.photoRemove")}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--salla-muted)]">{t("dresses.photoEmpty")}</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy || photos.length >= MAX_PHOTOS}
          onClick={() => deviceRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] disabled:opacity-60"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          {t("dresses.photoFromDevice")}
        </button>
        <button
          type="button"
          disabled={busy || photos.length >= MAX_PHOTOS}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] disabled:opacity-60"
        >
          <Camera className="h-4 w-4" aria-hidden />
          {t("dresses.photoCamera")}
        </button>
      </div>
      <input
        ref={deviceRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void take(file);
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void take(file);
        }}
      />
      {busy ? <p className="text-sm text-[var(--salla-muted)]">{t("dresses.photoUploading")}</p> : null}
      {error ? <p className="text-sm text-[var(--salla-primary)]">{t(error)}</p> : null}
    </div>
  );
}
