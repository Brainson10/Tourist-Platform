"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { uploadImageFile } from "@/lib/utils/api-client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** Paste a link, pick a file, or drop an image. Shows a live preview. */
export function ImageUrlField({ id, label, value, onChange, error, required, folder = "destinations", hint = "Upload a photo (JPEG, PNG, WebP, max 8 MB) or paste an https:// link." }) {
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const { notify } = useToast();
  const valid = /^(https:\/\/\S+|\/uploads\/\S+)$/i.test(value ?? "");

  async function upload(file) {
    if (!file) return;
    setUploading(true);
    const result = await uploadImageFile(file, folder);
    setUploading(false);
    if (!result.ok) return notify(result.message, "error");
    setBroken(false);
    onChange(result.url);
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {(aria) => (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            upload(event.dataTransfer.files?.[0]);
          }}
          className={cn("flex items-start gap-3 rounded-xl transition-colors", dragging && "bg-brand-soft outline-2 outline-dashed outline-link")}
        >
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
            {valid && !broken ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary hosts
              <img src={value} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-ink-subtle">{broken ? "Broken" : uploading ? "Uploading…" : "No image"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              {...aria}
              type="text"
              inputMode="url"
              value={value ?? ""}
              placeholder="https://… or upload"
              onChange={(event) => {
                setBroken(false);
                onChange(event.target.value);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
                <ImagePlus aria-hidden="true" className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload"}
              </Button>
              {value ? (
                <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                  Remove
                </Button>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
        </div>
      )}
    </Field>
  );
}
