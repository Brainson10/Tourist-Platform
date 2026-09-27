"use client";

import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest, uploadImageFile } from "@/lib/utils/api-client";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function RatingInput({ value, onChange, error }) {
  const [hover, setHover] = useState(0);

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">
        Your rating<span className="text-danger-ink" aria-hidden="true"> *</span>
      </legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="cursor-pointer" onMouseEnter={() => setHover(star)}>
            <input type="radio" name="rating" value={star} checked={value === star} onChange={() => onChange(star)} className="peer sr-only" />
            <span aria-hidden="true" className={cn("block text-3xl leading-none transition-colors peer-focus-visible:rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-link", star <= (hover || value) ? "text-highlight" : "text-line-strong")}>
              ★
            </span>
            <span className="sr-only">
              {star} star{star === 1 ? "" : "s"} — {LABELS[star]}
            </span>
          </label>
        ))}
        <span className="ml-2 text-sm text-ink-muted">{LABELS[hover || value]}</span>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-danger-ink">{error[0]}</p> : null}
    </fieldset>
  );
}

export function ReviewForm({ destinationId, existingReview, onDone }) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [photos, setPhotos] = useState(existingReview?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setFormError("");

    if (!rating) {
      setErrors({ rating: ["Choose a rating from 1 to 5"] });
      return;
    }

    setPending(true);
    const result = await apiRequest(`/api/destinations/${destinationId}/reviews`, { method: "POST", body: { rating, title, comment, photos } });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "" : result.message);
      return;
    }

    setErrors({});
    notify(result.message);
    onDone?.();
    router.refresh();
  }

  async function addPhotos(fileList) {
    const files = [...(fileList ?? [])].slice(0, 4 - photos.length);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(files.map((file) => uploadImageFile(file, "reviews")));
    setUploading(false);
    const failed = results.find((result) => !result.ok);
    if (failed) notify(failed.message, "error");
    setPhotos((current) => [...current, ...results.filter((result) => result.ok).map((result) => result.url)].slice(0, 4));
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <RatingInput value={rating} onChange={setRating} error={errors.rating} />
      <Field id="review-title" label="Headline" error={errors.title} hint="Optional — sum up your visit in a few words.">
        {(aria) => <Input {...aria} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} />}
      </Field>
      <Field id="review-comment" label="Your review" required error={errors.comment} hint="What should other travelers know? Best time, highlights, tips.">
        {(aria) => <Textarea {...aria} rows={5} value={comment} maxLength={2000} onChange={(event) => setComment(event.target.value)} />}
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">Photos</legend>
        <div className="flex flex-wrap items-center gap-2">
          {photos.map((url, index) => (
            <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of the traveler's upload */}
              <img src={url} alt={`Your photo ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((current) => current.filter((entry) => entry !== url))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-night/80 text-white"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 4 ? (
            <Button size="sm" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              {uploading ? "Uploading…" : photos.length ? "Add more" : "Add photos"}
            </Button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-ink-subtle">Optional · up to 4 photos · shown once your review is approved.</p>
        {errors.photos ? <p className="mt-1 text-xs font-medium text-danger-ink">{errors.photos[0]}</p> : null}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
      </fieldset>
      <FormMessage>{formError}</FormMessage>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Submitting…" : existingReview ? "Update review" : "Post review"}
        </Button>
        {onDone ? (
          <Button variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
