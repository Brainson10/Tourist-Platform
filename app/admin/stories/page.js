import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Stories" };

export default function StoriesAdminPage({ searchParams }) {
  return <ResourcePage resource="stories" title="Stories" description="Travel writing and local history linked to a destination." noun="story" searchParams={searchParams} needsDestinations />;
}
