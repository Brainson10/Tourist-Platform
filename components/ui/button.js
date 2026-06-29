import { cn } from "@/utils/helpers";

export function Button({ children, className = "", variant = "primary", ...props }) {
  const baseClasses = "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
