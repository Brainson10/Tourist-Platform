import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container size="narrow" className="py-24 text-center">
          <p className="text-sm font-semibold text-link">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">We couldn&apos;t find that page</h1>
          <p className="mt-3 text-ink-muted">The link may be old, or the place may have moved. Try searching for a destination instead.</p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/destinations">Browse destinations</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Go home
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
