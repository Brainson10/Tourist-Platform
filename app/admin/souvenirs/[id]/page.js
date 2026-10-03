import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { SouvenirForm } from "@/components/admin/souvenir-form";
import { isNotFound } from "@/lib/api/errors";
import { requireAdminPage } from "@/lib/auth/admin";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { getSouvenirForAdmin, listSellerOptions, listSouvenirCategoryOptions } from "@/lib/services/souvenir.service";
import { pluralize } from "@/lib/utils/format";

export const metadata = { title: "Edit souvenir" };

export default async function EditSouvenirPage({ params }) {
  const { id } = await params;
  await requireAdminPage(`/admin/souvenirs/${id}`);

  let souvenir;
  try {
    souvenir = await getSouvenirForAdmin(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }

  const [categories, destinations, sellers] = await Promise.all([listSouvenirCategoryOptions(), listDestinationOptions(), listSellerOptions()]);

  return (
    <>
      <Link href="/admin/souvenirs" className="text-sm font-medium text-link hover:underline">
        ← Souvenirs
      </Link>
      <div className="mt-3">
        <AdminHeader
          title={souvenir.name}
          description={`${souvenir.category.name} · ${pluralize(souvenir.sellers.length, "place")} to buy · ${pluralize(souvenir.photos.length, "photo")}${souvenir.isPublished ? "" : " · Draft"}`}
        />
      </div>
      <SouvenirForm key={souvenir.updatedAt.toISOString()} souvenir={souvenir} categories={categories} destinations={destinations} sellers={sellers} />
    </>
  );
}
