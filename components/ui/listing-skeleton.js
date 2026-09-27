import { Container } from "@/components/ui/container";
import { CardGridSkeleton, Skeleton } from "@/components/ui/states";

export function ListingSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-14" />
      <div className="mt-8">
        <CardGridSkeleton />
      </div>
    </Container>
  );
}
