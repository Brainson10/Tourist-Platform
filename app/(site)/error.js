"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function SiteError({ reset }) {
  return (
    <Container size="narrow" className="py-20 text-center">
      <h1 className="text-2xl font-semibold text-ink">This page didn&apos;t load</h1>
      <p className="mt-2 text-ink-muted">Something went wrong on our side. Please try again — if it keeps happening, come back in a few minutes.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </Container>
  );
}
