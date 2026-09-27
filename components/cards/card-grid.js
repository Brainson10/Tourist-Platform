import { cn } from "@/components/ui/cn";

export function CardGrid({ children, columns = 4, className }) {
  return (
    <div
      className={cn(
        "grid gap-x-5 gap-y-8 sm:grid-cols-2",
        columns === 4 && "lg:grid-cols-3 xl:grid-cols-4",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}
