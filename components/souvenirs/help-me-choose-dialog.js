"use client";

import { Gift } from "lucide-react";
import { useState } from "react";
import { HelpMeChoose } from "@/components/souvenirs/help-me-choose";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/** "Not sure what to buy?" button that opens Help me choose for one destination. */
export function HelpMeChooseDialog({ destination }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Gift aria-hidden="true" className="h-4 w-4" />
        Not sure what to buy? Help me choose
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Help me choose" description={`Souvenir ideas from ${destination.name} and around ${destination.state}`} size="lg">
        <HelpMeChoose destination={destination} framed={false} />
      </Dialog>
    </>
  );
}
