"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/** Mobile "Filters" button opening a bottom sheet with the filter fields (passed as children). */
export function FilterSheet({ action, activeCount, children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        Filters
        {activeCount ? <span className="rounded-full bg-brand-700 px-1.5 text-xs font-semibold text-white">{activeCount}</span> : null}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Filter local treasures" placement="sheet">
        <form action={action} onSubmit={() => setOpen(false)}>
          {children}
          <div className="sticky bottom-0 -mx-5 mt-5 flex gap-2 border-t border-line bg-surface px-5 pt-4">
            <Button type="submit" className="flex-1">
              Show results
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
