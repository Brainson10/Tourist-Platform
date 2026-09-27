import { cn } from "@/components/ui/cn";

const TONES = {
  neutral: "bg-surface-muted text-ink-muted",
  brand: "bg-brand-soft text-brand-strong",
  amber: "bg-warn-soft text-warn-ink",
  red: "bg-danger-soft text-danger-ink",
  blue: "bg-info-soft text-info-ink",
  overlay: "bg-surface/90 text-ink backdrop-blur",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", TONES[tone], className)}>
      {children}
    </span>
  );
}
