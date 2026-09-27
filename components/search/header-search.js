"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { SearchCombobox } from "@/components/search/search-combobox";
import { Dialog } from "@/components/ui/dialog";

/** Search button in the header; opens the suggestion search in a dialog (focus-trapped, Esc closes). */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Search" className="mt-[12vh]! mb-auto!">
        <div className="min-h-[18rem] pb-2">
          <SearchCombobox autoFocus inlineResults onNavigate={() => setOpen(false)} />
        </div>
      </Dialog>
    </>
  );
}
