import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Villages" };

export default function VillagesAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="villages"
      title="Villages & towns"
      description="Destinations take their district and state from the village they belong to."
      noun="village"
      searchParams={searchParams}
    />
  );
}
