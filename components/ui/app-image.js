import Image from "next/image";
import { cn } from "@/components/ui/cn";

// Hosts configured in next.config.mjs images.remotePatterns get optimized.
// Other https images (e.g. pasted by an admin) are shown as-is instead of crashing.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com", "res.cloudinary.com"]);

function isOptimizable(src) {
  if (src.startsWith("/")) return true; // our own /uploads files
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function AppImage({ src, alt, className, fallbackLabel, fill = true, sizes = "100vw", priority = false, ...props }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex items-center justify-center bg-gradient-to-br from-brand-soft to-surface-muted text-brand-strong/60", fill && "absolute inset-0", className)}
      >
        <span className="px-3 text-center text-sm font-medium">{fallbackLabel ?? ""}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      // Next 16 deprecates `priority`; eager + high fetch priority is the recommended replacement for LCP images.
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={!isOptimizable(src)}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}
