"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckboxChips } from "@/components/admin/checkbox-chips";
import { FormSection } from "@/components/admin/form-section";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { SellerPicker } from "@/components/admin/seller-picker";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { AUDIENCES, AVAILABILITY, INTERESTS, PHOTO_KINDS, QUALITIES } from "@/lib/constants/souvenirs";
import { apiRequest } from "@/lib/utils/api-client";
import { slugify } from "@/lib/utils/slugify";

const TEXT_FIELDS = ["name", "slug", "shortDescription", "description", "whySpecial", "whyTakeHome", "authenticityTips", "carryTips", "availabilityNote", "coverImage", "categoryId"];

function toFormValues(souvenir) {
  if (!souvenir) {
    return {
      ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
      priceMin: "",
      priceMax: "",
      availability: "YEAR_ROUND",
      destinationIds: [],
      sellers: [],
      photos: [],
      audiences: [],
      interests: [],
      qualities: [],
      isPublished: true,
      isFeatured: false,
      needsVerification: false,
    };
  }

  return {
    ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, souvenir[field] ?? ""])),
    priceMin: souvenir.priceMin ?? "",
    priceMax: souvenir.priceMax ?? "",
    availability: souvenir.availability,
    destinationIds: souvenir.destinations.map(({ destination }) => destination.id),
    sellers: souvenir.sellers.map(({ seller, note }) => ({ sellerId: seller.id, note: note ?? "" })),
    photos: souvenir.photos.map((photo) => ({ url: photo.url, caption: photo.caption ?? "", kind: photo.kind })),
    audiences: souvenir.audiences,
    interests: souvenir.interests,
    qualities: souvenir.qualities,
    isPublished: souvenir.isPublished,
    isFeatured: souvenir.isFeatured,
    needsVerification: souvenir.needsVerification,
  };
}

export function SouvenirForm({ souvenir, categories, destinations, sellers }) {
  const [values, setValues] = useState(() => toFormValues(souvenir));
  const [slugTouched, setSlugTouched] = useState(Boolean(souvenir));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value, ...(name === "name" && !slugTouched ? { slug: slugify(value) } : {}) }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    const result = await apiRequest(souvenir ? `/api/admin/souvenirs/${souvenir?.id}` : "/api/admin/souvenirs", {
      method: souvenir ? "PUT" : "POST",
      body: values,
    });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "Some fields need attention — see the highlighted messages below." : result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    notify(souvenir ? "Souvenir saved" : "Souvenir created");

    if (souvenir) {
      router.refresh();
    } else {
      router.push(`/admin/souvenirs/${result.data.id}`);
    }
  }

  async function remove() {
    setPending(true);
    const result = await apiRequest(`/api/admin/souvenirs/${souvenir?.id}`, { method: "DELETE" });
    setPending(false);
    setConfirmDelete(false);

    if (!result.ok) {
      notify(result.message, "error");
      return;
    }

    notify("Souvenir deleted");
    router.push("/admin/souvenirs");
    router.refresh();
  }

  const text = (name, label, props = {}) => (
    <Field id={`s-${name}`} label={label} error={errors[name]} required={props.required} hint={props.hint} className={props.half ? "" : "sm:col-span-2"}>
      {(aria) =>
        props.rows ? (
          <Textarea {...aria} rows={props.rows} value={values[name] ?? ""} onChange={(event) => update(name, event.target.value)} placeholder={props.placeholder} />
        ) : (
          <Input {...aria} type={props.type ?? "text"} min={props.min} inputMode={props.inputMode} value={values[name] ?? ""} onChange={(event) => update(name, event.target.value)} placeholder={props.placeholder} />
        )
      }
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormMessage>{formError}</FormMessage>

      <FormSection title="Basics" description="What it is and where travelers find it.">
        {text("name", "Name", { required: true, half: true, placeholder: "Longpi black pottery" })}
        <Field id="s-slug" label="URL slug" required error={errors.slug} hint={`/souvenirs/${values.slug || "…"}`}>
          {(aria) => (
            <Input
              {...aria}
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", slugify(event.target.value));
              }}
            />
          )}
        </Field>
        <Field
          id="s-category"
          label="Category"
          required
          error={errors.categoryId}
          hint={
            <>
              Missing one?{" "}
              <Link href="/admin/souvenir-categories" className="font-medium text-link hover:underline">
                Manage categories
              </Link>
            </>
          }
        >
          {(aria) => (
            <Select {...aria} value={values.categoryId} onChange={(event) => update("categoryId", event.target.value)}>
              <option value="">Choose a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <CheckboxChips
          legend="Destinations"
          hint="Where it comes from or is easiest to find. It also shows for other destinations in the same state."
          options={destinations.map((destination) => ({ value: destination.id, label: destination.name }))}
          selected={values.destinationIds}
          onChange={(destinationIds) => update("destinationIds", destinationIds)}
          error={errors.destinationIds}
        />
      </FormSection>

      <FormSection title="Story" description="Tell travelers why this matters — the story sells it, not the price.">
        {text("shortDescription", "One-line story", { required: true, rows: 2, hint: "Shown on cards (max 200 characters)." })}
        {text("description", "Description", { required: true, rows: 5, hint: "Separate paragraphs with a blank line." })}
        {text("whySpecial", "Why it's special", { required: true, rows: 3, hint: "Who makes it, how, and what it means locally." })}
        {text("whyTakeHome", "Why take it home?", { required: true, rows: 2 })}
        {text("authenticityTips", "How to spot the real thing", { rows: 2, hint: "Helps travelers avoid imitations." })}
      </FormSection>

      <FormSection title="Price & practical" description="Approximate local prices in whole rupees. Leave both empty if prices vary too much.">
        {text("priceMin", "From (₹)", { half: true, type: "number", min: 0, inputMode: "numeric" })}
        {text("priceMax", "Up to (₹)", { half: true, type: "number", min: 0, inputMode: "numeric" })}
        <Field id="s-availability" label="Availability" error={errors.availability}>
          {(aria) => (
            <Select {...aria} value={values.availability} onChange={(event) => update("availability", event.target.value)}>
              {AVAILABILITY.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("availabilityNote", "Availability note", { half: true, placeholder: "Fresh harvest from November" })}
        {text("carryTips", "Carrying it home", { rows: 2, hint: "Size, fragility, shelf life, airline rules." })}
      </FormSection>

      <FormSection title="Who it's for" description="Powers the filters and “Help me choose”.">
        <CheckboxChips legend="Good for" options={AUDIENCES} selected={values.audiences} onChange={(audiences) => update("audiences", audiences)} error={errors.audiences} />
        <CheckboxChips legend="Interests" options={INTERESTS} selected={values.interests} onChange={(interests) => update("interests", interests)} error={errors.interests} />
        <CheckboxChips legend="Qualities" hint="Shown as badges. Only tick what is true." options={QUALITIES} selected={values.qualities} onChange={(qualities) => update("qualities", qualities)} error={errors.qualities} />
      </FormSection>

      <FormSection title="Where to buy">
        <SellerPicker sellers={sellers} value={values.sellers} onChange={(next) => update("sellers", next)} error={errors.sellers} />
      </FormSection>

      <FormSection title="Photos" description="Use real photos of the product, its making or the market — no stock images. Without photos, cards show a woven pattern with the category icon.">
        <div className="sm:col-span-2">
          <ImageUrlField id="s-cover" label="Cover image" folder="souvenirs" value={values.coverImage} onChange={(value) => update("coverImage", value)} error={errors.coverImage} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">Gallery</p>
          <GalleryEditor
            photos={values.photos}
            onChange={(photos) => update("photos", photos)}
            coverImage={values.coverImage}
            onCoverChange={(url) => update("coverImage", url)}
            error={errors.photos}
            folder="souvenirs"
            maxPhotos={12}
            noun="A souvenir"
            kinds={PHOTO_KINDS}
          />
        </div>
      </FormSection>

      <FormSection title="Publishing">
        <div className="space-y-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={values.isPublished} onChange={(event) => update("isPublished", event.target.checked)} className="h-4 w-4 accent-brand-700" />
            Published — visible to travelers
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={values.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} className="h-4 w-4 accent-brand-700" />
            Featured — shown first and on the home page
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={values.needsVerification} onChange={(event) => update("needsVerification", event.target.checked)} className="h-4 w-4 accent-brand-700" />
            Needs verification — travelers see a “details still being checked” note
          </label>
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : souvenir ? "Save changes" : "Create souvenir"}
          </Button>
          <ButtonLink href="/admin/souvenirs" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
        {souvenir ? (
          <div className="flex gap-2">
            {souvenir.isPublished ? (
              <ButtonLink href={`/souvenirs/${souvenir.slug}`} variant="ghost" target="_blank">
                View live page ↗
              </ButtonLink>
            ) : null}
            <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)} disabled={pending}>
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {souvenir ? (
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={remove}
          pending={pending}
          title="Delete this souvenir?"
          description={`“${souvenir.name}” and its photos will be permanently deleted. The places to buy it are kept.`}
        />
      ) : null}
    </form>
  );
}
