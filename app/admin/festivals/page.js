import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Festivals" };

export default function FestivalsAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="festivals"
      title="Festivals & events"
      description="Leave dates empty when they haven't been announced — travelers will see “Dates to be announced”."
      noun="festival"
      searchParams={searchParams}
      needsDestinations
    />
  );
}
