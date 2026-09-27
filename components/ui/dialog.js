"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

/** Accessible modal built on the native <dialog> element (focus trap + Esc for free). */
export function Dialog({ open, onClose, title, description, children, className, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element (the close button); honour an explicit target instead.
      dialog.querySelector("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto max-h-[90vh] w-[calc(100%-2rem)] rounded-xl bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/40",
        size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-sm" : "max-w-lg",
        className
      )}
    >
      {open ? (
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id="dialog-title" className="text-lg font-semibold">
                {title}
              </h2>
              {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-xl leading-none text-ink-muted hover:bg-surface-muted hover:text-ink" aria-label="Close">
              ×
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Delete", pending = false }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
