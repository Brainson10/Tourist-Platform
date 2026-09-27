import { ResourcePage } from "@/components/admin/resource-page";
import { titleCase } from "@/lib/utils/format";
import { EXPERIENCE_CATEGORIES } from "@/lib/validators/common";

export const metadata = { title: "Experiences" };

export default function ExperiencesAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="experiences"
      title="Experiences"
      description="Activities travelers can add to their trips."
      noun="experience"
      searchParams={searchParams}
      needsDestinations
      filters={[{ name: "category", label: "All types", options: EXPERIENCE_CATEGORIES.map((value) => ({ value, label: titleCase(value) })) }]}
    />
  );
}
