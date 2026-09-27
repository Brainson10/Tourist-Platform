import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdminPage } from "@/lib/auth/admin";
import { getSettings } from "@/lib/services/settings.service";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdminPage("/admin/settings");
  const settings = await getSettings();

  return (
    <>
      <AdminHeader title="Settings" />
      <SettingsForm settings={settings} />
    </>
  );
}
