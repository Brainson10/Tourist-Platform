import Link from "next/link";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Stars } from "@/components/ui/rating";
import { requireUserPage } from "@/lib/auth/session";
import { listReviewsForUser } from "@/lib/services/review.service";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Profile" };

const STATUS = { PENDING: ["amber", "Awaiting approval"], APPROVED: ["brand", "Published"], HIDDEN: ["red", "Not published"] };

export default async function ProfilePage() {
  const user = await requireUserPage("/profile");
  const reviews = await listReviewsForUser(user.id);

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Profile</h1>
      <p className="mt-1 text-ink-muted">Member since {formatDate(user.createdAt)}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="details-title">
          <h2 id="details-title" className="text-lg font-semibold text-ink">
            Your details
          </h2>
          <div className="mt-4 space-y-6">
            <AvatarUploader user={user} />
            <ProfileForm user={user} />
          </div>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="password-title">
          <h2 id="password-title" className="text-lg font-semibold text-ink">
            Password
          </h2>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="reviews-title">
        <h2 id="reviews-title" className="text-lg font-semibold text-ink">
          Your reviews
        </h2>
        {reviews.length ? (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
            {reviews.map((review) => {
              const [tone, label] = STATUS[review.status];

              return (
                <li key={review.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/destinations/${review.destination.slug}#reviews`} className="font-semibold text-ink hover:underline">
                      {review.destination.name}
                    </Link>
                    <Badge tone={tone}>{label}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                    <Stars value={review.rating} />
                    <span className="sr-only">{review.rating} out of 5</span>
                    {formatDate(review.updatedAt)}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{review.comment}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">You haven&apos;t reviewed any places yet. Reviews help other travelers plan better.</p>
        )}
      </section>
    </Container>
  );
}
