import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DestinationForm } from "@/components/admin/destination-form";
import { requireAdminPage } from "@/lib/auth/admin";
import { listAllCategories, listAllVillages } from "@/lib/services/place.service";

export const metadata = { title: "New destination" };

export default async function NewDestinationPage() {
  await requireAdminPage("/admin/destinations/new");
  const [villages, categories] = await Promise.all([listAllVillages(), listAllCategories()]);

  return (
    <>
      <Link href="/admin/destinations" className="text-sm font-medium text-link hover:underline">
        ← Destinations
      </Link>
      <div className="mt-3">
        <AdminHeader title="New destination" description="Only the Basics and Description sections are required. Everything else can be added later." />
      </div>
      {villages.length ? (
        <DestinationForm villages={villages} categories={categories} />
      ) : (
        <p className="rounded-xl border border-warn-line bg-warn-soft p-5 text-sm text-warn-ink">
          Add at least one village first — destinations take their district and state from it.{" "}
          <Link href="/admin/villages" className="font-semibold underline">
            Go to villages
          </Link>
        </p>
      )}
    </>
  );
}
