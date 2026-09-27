import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Categories" };

export default function CategoriesAdminPage({ searchParams }) {
  return <ResourcePage resource="categories" title="Categories" description="Interests travelers can filter destinations by." noun="category" searchParams={searchParams} />;
}
