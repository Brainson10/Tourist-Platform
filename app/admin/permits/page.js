import { ResourcePage } from "@/components/admin/resource-page";

export const metadata = { title: "Permits" };

export default function PermitsAdminPage({ searchParams }) {
  return (
    <ResourcePage
      resource="permits"
      title="Entry permits"
      description="Inner Line Permit and other entry rules per state, shown on every destination in that state. Rules change — record when you last checked."
      noun="permit rule"
      searchParams={searchParams}
      needsStates
    />
  );
}
