"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Printer, Share2 } from "lucide-react";
import { SharePanel } from "@/components/trips/share-panel";
import { TripForm } from "@/components/trips/trip-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

export function TripActions({ trip, destinations }) {
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  async function deleteTrip() {
    setPending(true);
    const result = await apiRequest(`/api/trips/${trip.id}`, { method: "DELETE" });
    setPending(false);

    if (!result.ok) {
      notify(result.message, "error");
      return;
    }

    notify("Trip deleted");
    router.push("/trips");
    router.refresh();
  }

  return (
    <>
      <div className="no-print flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setSharing(true)}>
          <Share2 aria-hidden="true" className="h-4 w-4" />
          {trip.shareUrlPath ? "Shared" : "Share"}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer aria-hidden="true" className="h-4 w-4" />
          Print
        </Button>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit trip
        </Button>
        <Button variant="danger-ghost" onClick={() => setDeleting(true)}>
          Delete
        </Button>
      </div>
      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit trip" description="Shortening a trip removes activities on the days that no longer exist.">
        {editing ? <TripForm destinations={destinations} trip={trip} onSaved={() => setEditing(false)} /> : null}
      </Dialog>
      <Dialog open={sharing} onClose={() => setSharing(false)} title="Share this trip">
        {sharing ? <SharePanel tripId={trip.id} sharePath={trip.shareUrlPath} /> : null}
      </Dialog>
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={deleteTrip}
        pending={pending}
        title="Delete this trip?"
        description="Your itinerary and notes will be permanently deleted."
        confirmLabel="Delete trip"
      />
    </>
  );
}
