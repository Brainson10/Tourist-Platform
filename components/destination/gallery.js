"use client";

import { useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/components/ui/cn";

// Tile layouts by how many photos are previewed: first tile is always the large one.
const LAYOUTS = {
  1: { grid: "grid-cols-1", first: "aspect-[16/7]", rest: "" },
  2: { grid: "grid-cols-2", first: "aspect-[4/3] sm:aspect-[16/10]", rest: "aspect-[4/3] sm:aspect-[16/10]" },
  3: { grid: "grid-cols-3 sm:grid-rows-2", first: "col-span-3 aspect-[16/9] sm:col-span-2 sm:row-span-2 sm:aspect-auto", rest: "hidden aspect-[4/3] sm:block" },
  5: { grid: "grid-cols-4 sm:grid-rows-2", first: "col-span-4 aspect-[16/9] sm:col-span-2 sm:row-span-2 sm:aspect-auto", rest: "hidden aspect-[4/3] sm:block" },
};

/** `fallback` replaces the default "Photos coming soon" block when there are no (working) photos. */
export function Gallery({ name, photos: allPhotos, fallback = null }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(() => new Set());
  const photos = allPhotos.filter((photo) => !failed.has(photo.url));
  const markFailed = (url) => setFailed((current) => (current.has(url) ? current : new Set(current).add(url)));
  // An image can fail before hydration, when onError isn't attached yet; check once it mounts.
  const checkLoaded = (url) => (image) => {
    if (image?.complete && image.naturalWidth === 0) markFailed(url);
  };

  if (!photos.length) {
    if (fallback) return fallback;
    return (
      <div className="relative aspect-[16/7] overflow-hidden rounded-xl">
        <AppImage src={null} alt={name} fallbackLabel="Photos coming soon" />
      </div>
    );
  }

  const previewCount = photos.length >= 5 ? 5 : photos.length >= 3 ? 3 : photos.length;
  const layout = LAYOUTS[previewCount];
  const preview = photos.slice(0, previewCount);
  const extra = photos.length - preview.length;

  return (
    <>
      <div className={cn("grid gap-2 overflow-hidden rounded-xl", layout.grid)}>
        {preview.map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setOpen(true)}
            className={cn("relative overflow-hidden bg-surface-muted", index === 0 ? layout.first : layout.rest)}
            aria-label={`Open photo ${index + 1} of ${photos.length}`}
          >
            <AppImage
              src={photo.url}
              alt={photo.caption || `${name} photo ${index + 1}`}
              priority={index === 0}
              sizes={index === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"}
              className="transition-transform duration-500 hover:scale-[1.03]"
              ref={checkLoaded(photo.url)}
              onError={() => markFailed(photo.url)}
            />
            {index === preview.length - 1 && extra > 0 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">+{extra} more</span>
            ) : null}
          </button>
        ))}
      </div>
      {photos.length > 1 ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-2 text-sm font-medium text-link hover:underline">
          View all {photos.length} photos
        </button>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} title={`${name} photos`} size="lg">
        <div className="grid gap-3">
          {photos.map((photo, index) => (
            <figure key={photo.url}>
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface-muted">
                <AppImage src={photo.url} alt={photo.caption || `${name} photo ${index + 1}`} sizes="(min-width: 768px) 720px, 100vw" onError={() => markFailed(photo.url)} />
              </div>
              {photo.caption ? <figcaption className="mt-1 text-sm text-ink-muted">{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </Dialog>
    </>
  );
}
