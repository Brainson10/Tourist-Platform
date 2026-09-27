"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

/** A row of small thumbnails; clicking one opens all photos in a dialog. */
export function PhotoStrip({ photos, label = "Photos" }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!photos?.length) return null;

  return (
    <>
      <ul className="mt-2 flex flex-wrap gap-2" aria-label={label}>
        {photos.map((url, index) => (
          <li key={url}>
            <button type="button" onClick={() => setOpenIndex(index)} className="block h-16 w-16 overflow-hidden rounded-lg border border-line bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnails from mixed hosts */}
              <img src={url} alt={`${label} ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={openIndex !== null} onClose={() => setOpenIndex(null)} title={label} size="lg">
        <div className="grid gap-3">
          {photos.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- full-size view
            <img key={url} src={url} alt={`${label} ${index + 1}`} loading="lazy" className="w-full rounded-lg" />
          ))}
        </div>
      </Dialog>
    </>
  );
}
