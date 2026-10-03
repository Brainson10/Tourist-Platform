import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Souvenir categories" };

export default function SouvenirCategoriesAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="souvenir-categories"
      title="Souvenir categories"
      description="How local treasures are grouped on “Take Home a Memory” — textiles, pottery, food and so on."
      noun="category"
      searchParams={searchParams}
    />
  );
}
