"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }) {
  return (
    <div role="alert" className="rounded-xl border border-warn-line bg-warn-soft p-6">
      <h1 className="font-semibold text-warn-ink">This admin page failed to load</h1>
      <p className="mt-1 text-sm text-warn-ink">Check that the database is reachable, then try again.</p>
      <Button className="mt-4" variant="secondary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
