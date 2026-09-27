import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { DestinationForm } from "@/components/admin/destination-form";
import { isNotFound } from "@/lib/api/errors";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDestinationForAdmin } from "@/lib/services/destination.service";
import { listAllCategories, listAllVillages } from "@/lib/services/place.service";

export const metadata = { title: "Edit destination" };

export default async function EditDestinationPage({ params }) {
  const { id } = await params;
  await requireAdminPage(`/admin/destinations/${id}`);

  let destination;
  try {
    destination = await getDestinationForAdmin(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }

  const [villages, categories] = await Promise.all([listAllVillages(), listAllCategories()]);

  return (
    <>
      <Link href="/admin/destinations" className="text-sm font-medium text-link hover:underline">
        ← Destinations
      </Link>
      <div className="mt-3">
        <AdminHeader title={destination.name} description={`${destination.experiences.length} experiences · ${destination.festivals.length} festivals · ${destination.reviewCount} published reviews`} />
      </div>
      <DestinationForm key={destination.updatedAt.toISOString()} destination={destination} villages={villages} categories={categories} />
    </>
  );
}
