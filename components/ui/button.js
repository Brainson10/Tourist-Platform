import Link from "next/link";
import { cn } from "@/components/ui/cn";

const VARIANTS = {
  primary: "bg-brand-700 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-800 disabled:bg-brand-700/60",
  accent: "bg-accent-500 text-white shadow-sm shadow-accent-700/20 hover:bg-accent-600 disabled:bg-accent-500/60",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink-subtle hover:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/60",
  "danger-ghost": "text-danger-ink hover:bg-danger-soft",
  inverse: "bg-surface text-ink hover:bg-surface-muted",
};

const SIZES = {
  sm: "h-8 gap-1.5 rounded-full px-3.5 text-sm",
  md: "h-10 gap-2 rounded-full px-5 text-sm",
  lg: "h-12 gap-2 rounded-full px-6 text-base",
  icon: "h-9 w-9 rounded-full",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export function Button({ variant, size, className, type = "button", ...props }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
