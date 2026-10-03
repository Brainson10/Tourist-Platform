"use client";

import { useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { SouvenirArt } from "@/components/souvenirs/souvenir-art";

/** The product photo, or the woven stand-in when there is none or it fails to load. */
export function SouvenirImage({ src, alt, icon, fallbackLabel, sizes, priority = false, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <SouvenirArt name={alt} icon={icon} label={fallbackLabel} />;

  return (
    <AppImage
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={className}
      // An image can fail before hydration, when onError isn't attached yet; check once it mounts.
      ref={(image) => {
        if (image?.complete && image.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
