import { Container } from "@/components/ui/container";
import { CardGridSkeleton, Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-[420px] rounded-none" />
      <Container className="py-14">
        <CardGridSkeleton count={4} />
      </Container>
    </>
  );
}
