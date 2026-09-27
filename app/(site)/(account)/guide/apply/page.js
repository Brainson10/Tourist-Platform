import Link from "next/link";
import { GuideProfileForm } from "@/components/guides/guide-profile-form";
import { Container } from "@/components/ui/container";
import { requireUserPage } from "@/lib/auth/session";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { getMyGuideProfile } from "@/lib/services/guide.service";

export const metadata = { title: "Become a guide" };

export default async function GuideApplyPage() {
  const user = await requireUserPage("/guide/apply");
  const [profile, destinations] = await Promise.all([getMyGuideProfile(user), listDestinationOptions()]);

  return (
    <Container size="narrow" className="py-10">
      <Link href="/guide" className="text-sm font-medium text-link hover:underline">
        ← Guide dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{profile ? "Your guide profile" : "Become a local guide"}</h1>
      <p className="mt-1 text-ink-muted">
        {profile ? "Changes to an approved profile go live straight away." : "Tell travelers who you are and where you can take them. Our team reviews every application."}
      </p>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <GuideProfileForm profile={profile} destinations={destinations} />
      </div>
    </Container>
  );
}
