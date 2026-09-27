"use client";

import { LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const MESSAGES = {
  1: "Location access is blocked. Allow it in your browser settings to see places near you.",
  2: "We couldn't find your location. Check that location services are on.",
  3: "Finding your location took too long. Please try again.",
};

/** Asks for the traveler's location once, then sorts destinations by distance. */
export function NearMeButton({ active }) {
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  function locate() {
    if (active) {
      router.push("/destinations");
      return;
    }

    if (!("geolocation" in navigator)) {
      notify("Your browser can't share its location.", "error");
      return;
    }

    setPending(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPending(false);
        // Rounded to ~1 km: enough to sort by distance without sharing an exact position.
        router.push(`/destinations?near=${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`);
      },
      (error) => {
        setPending(false);
        notify(MESSAGES[error.code] ?? MESSAGES[2], "error");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 }
    );
  }

  return (
    <Button variant={active ? "primary" : "secondary"} size="sm" onClick={locate} disabled={pending} aria-pressed={Boolean(active)}>
      <LocateFixed aria-hidden="true" className="h-4 w-4" />
      {pending ? "Locating…" : active ? "Near me · on" : "Near me"}
    </Button>
  );
}
