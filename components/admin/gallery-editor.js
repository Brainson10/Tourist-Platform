"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { uploadImageFile } from "@/lib/utils/api-client";

function PhotoTile({ photo, index, isCover, kinds, onCaption, onKind, onRemove, onCover }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: photo.url });

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("overflow-hidden rounded-xl border border-line bg-surface", isDragging && "z-10 shadow-lg")}>
      <div className="relative aspect-[4/3] bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary hosts */}
        <img src={photo.url} alt={photo.caption || `Photo ${index + 1}`} className="h-full w-full object-cover" />
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="absolute left-2 top-2 flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm active:cursor-grabbing"
          aria-label={`Drag to reorder photo ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>
        {index === 0 ? <span className="absolute bottom-2 left-2 rounded-md bg-surface/90 px-1.5 py-0.5 text-[11px] font-medium text-ink">First in gallery</span> : null}
        {isCover ? <span className="absolute bottom-2 right-2 rounded-md bg-marigold-400 px-1.5 py-0.5 text-[11px] font-semibold text-night">Cover</span> : null}
      </div>
      <div className="space-y-2 p-2">
        <label className="sr-only" htmlFor={`caption-${index}`}>
          Caption for photo {index + 1}
        </label>
        <Input id={`caption-${index}`} value={photo.caption} maxLength={200} placeholder="Caption (optional)" className="py-1.5 text-xs" onChange={(event) => onCaption(event.target.value)} />
        {kinds ? (
          <>
            <label className="sr-only" htmlFor={`kind-${index}`}>
              What photo {index + 1} shows
            </label>
            <Select id={`kind-${index}`} value={photo.kind ?? kinds[0].value} className="py-1.5 text-xs" onChange={(event) => onKind(event.target.value)}>
              {kinds.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </Select>
          </>
        ) : null}
        <div className="flex justify-between">
          <Button size="sm" variant="ghost" disabled={isCover} onClick={onCover}>
            <Star aria-hidden="true" className="h-3.5 w-3.5" />
            {isCover ? "Cover" : "Use as cover"}
          </Button>
          <Button size="sm" variant="danger-ghost" onClick={onRemove} aria-label={`Remove photo ${index + 1}`}>
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}

/**
 * Photos for a record: upload several, paste links, reorder, caption, pick the cover.
 * `kinds` ([{ value, label }]) adds a "what does this photo show" select to each tile.
 */
export function GalleryEditor({ photos, onChange, coverImage, onCoverChange, error, folder = "destinations", maxPhotos = 20, noun = "A destination", kinds = null }) {
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef(null);
  const dndId = useId();
  const { notify } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function addUrls(urls) {
    const existing = new Set(photos.map((photo) => photo.url));
    const fresh = urls.filter((url) => !existing.has(url)).map((url) => ({ url, caption: "", ...(kinds ? { kind: kinds[0].value } : {}) }));
    const next = [...photos, ...fresh].slice(0, maxPhotos);
    if (photos.length + fresh.length > maxPhotos) notify(`${noun} can have up to ${maxPhotos} photos.`, "error");
    onChange(next);
    if (!coverImage && next.length) onCoverChange(next[0].url);
  }

  async function uploadFiles(fileList) {
    const files = [...(fileList ?? [])].slice(0, maxPhotos - photos.length);
    if (!files.length) return;
    setUploading(files.length);
    const results = await Promise.all(files.map((file) => uploadImageFile(file, folder)));
    setUploading(0);
    const failed = results.filter((result) => !result.ok);
    if (failed.length) notify(failed[0].message, "error");
    addUrls(results.filter((result) => result.ok).map((result) => result.url));
  }

  function addLink() {
    const url = link.trim();
    if (!/^https:\/\/\S+$/i.test(url)) return notify("Paste a full https:// image link.", "error");
    addUrls([url]);
    setLink("");
  }

  return (
    <div
      onDragOver={(event) => event.dataTransfer?.types?.includes("Files") && event.preventDefault()}
      onDrop={(event) => {
        if (!event.dataTransfer?.files?.length) return;
        event.preventDefault();
        uploadFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" disabled={Boolean(uploading) || photos.length >= maxPhotos} onClick={() => inputRef.current?.click()}>
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          {uploading ? `Uploading ${uploading}…` : "Upload photos"}
        </Button>
        <span className="text-xs text-ink-subtle">or drop images here · {photos.length}/{maxPhotos}</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <div className="mt-2 flex gap-2">
        <label htmlFor="gallery-link" className="sr-only">
          Image link
        </label>
        <Input
          id="gallery-link"
          value={link}
          placeholder="…or paste an https:// image link"
          onChange={(event) => setLink(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addLink();
            }
          }}
        />
        <Button variant="secondary" onClick={addLink} disabled={!link.trim()}>
          Add
        </Button>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-danger-ink">{Array.isArray(error) ? error[0] : error}</p> : null}

      {photos.length ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            const from = photos.findIndex((photo) => photo.url === active.id);
            const to = photos.findIndex((photo) => photo.url === over.id);
            onChange(arrayMove(photos, from, to));
          }}
        >
          <SortableContext items={photos.map((photo) => photo.url)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {photos.map((photo, index) => (
                <PhotoTile
                  key={photo.url}
                  photo={photo}
                  index={index}
                  isCover={coverImage === photo.url}
                  kinds={kinds}
                  onCaption={(caption) => onChange(photos.map((entry) => (entry.url === photo.url ? { ...entry, caption } : entry)))}
                  onKind={(kind) => onChange(photos.map((entry) => (entry.url === photo.url ? { ...entry, kind } : entry)))}
                  onRemove={() => {
                    onChange(photos.filter((entry) => entry.url !== photo.url));
                    if (coverImage === photo.url) onCoverChange("");
                  }}
                  onCover={() => onCoverChange(photo.url)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-subtle">No photos yet. Upload a few — the first one leads the gallery.</p>
      )}
    </div>
  );
}
