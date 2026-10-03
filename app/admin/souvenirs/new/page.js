import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { SouvenirForm } from "@/components/admin/souvenir-form";
import { requireAdminPage } from "@/lib/auth/admin";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { listSellerOptions, listSouvenirCategoryOptions } from "@/lib/services/souvenir.service";

export const metadata = { title: "New souvenir" };

export default async function NewSouvenirPage() {
  await requireAdminPage("/admin/souvenirs/new");
  const [categories, destinations, sellers] = await Promise.all([listSouvenirCategoryOptions(), listDestinationOptions(), listSellerOptions()]);
  const missing = !categories.length ? { href: "/admin/souvenir-categories", text: "Add at least one souvenir category first.", link: "Go to souvenir categories" } : !destinations.length ? { href: "/admin/destinations/new", text: "Add a destination first — every souvenir belongs to one.", link: "New destination" } : null;

  return (
    <>
      <Link href="/admin/souvenirs" className="text-sm font-medium text-link hover:underline">
        ← Souvenirs
      </Link>
      <div className="mt-3">
        <AdminHeader title="New souvenir" description="Basics and Story are required. Prices, places to buy and photos can be added later." />
      </div>
      {missing ? (
        <p className="rounded-xl border border-warn-line bg-warn-soft p-5 text-sm text-warn-ink">
          {missing.text}{" "}
          <Link href={missing.href} className="font-semibold underline">
            {missing.link}
          </Link>
        </p>
      ) : (
        <SouvenirForm categories={categories} destinations={destinations} sellers={sellers} />
      )}
    </>
  );
}
