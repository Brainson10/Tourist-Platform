import { cn } from "@/components/ui/cn";

export function Container({ className, children, size = "default" }) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl", className)}>
      {children}
    </div>
  );
}
