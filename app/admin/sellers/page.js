import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Places to buy" };

export default function SellersAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="sellers"
      title="Places to buy"
      description="Markets, shops, workshops and cooperatives where travelers can find local souvenirs. Each one appears on the map of the souvenirs it's linked to."
      noun="place"
      searchParams={searchParams}
      needsVillages
    />
  );
}
