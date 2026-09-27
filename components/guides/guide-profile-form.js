"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

export function GuideProfileForm({ profile, destinations }) {
  const [values, setValues] = useState({
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    languages: profile?.languages?.join(", ") ?? "",
    yearsExperience: profile?.yearsExperience ?? 0,
    phone: profile?.phone ?? "",
    photoUrl: profile?.photoUrl ?? "",
    areaIds: profile?.areas?.map((area) => area.destinationId) ?? [],
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const toggleArea = (id) => update("areaIds", values.areaIds.includes(id) ? values.areaIds.filter((item) => item !== id) : [...values.areaIds, id]);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const result = await apiRequest("/api/guide/profile", { method: "PUT", body: { ...values, yearsExperience: Number(values.yearsExperience) || 0 } });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "Please check the highlighted fields." : result.message);
      return;
    }

    notify(result.message);
    router.push("/guide");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <ImageUrlField id="guide-photo" label="Your photo" folder="guides" value={values.photoUrl} onChange={(value) => update("photoUrl", value)} error={errors.photoUrl} hint="A friendly, clear photo of your face helps travelers trust you." />
      <Field id="guide-headline" label="Headline" required hint="e.g. Birding and village walks around Loktak Lake" error={errors.headline}>
        {(aria) => <Input {...aria} maxLength={120} value={values.headline} onChange={(event) => update("headline", event.target.value)} />}
      </Field>
      <Field id="guide-bio" label="About you" required hint="Where you grew up, what you love showing people, how you like to guide." error={errors.bio}>
        {(aria) => <Textarea {...aria} rows={6} maxLength={3000} value={values.bio} onChange={(event) => update("bio", event.target.value)} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="guide-languages" label="Languages" required hint="Separate with commas: English, Hindi, Manipuri" error={errors.languages}>
          {(aria) => <Input {...aria} value={values.languages} onChange={(event) => update("languages", event.target.value)} />}
        </Field>
        <Field id="guide-years" label="Years of experience" error={errors.yearsExperience}>
          {(aria) => <Input {...aria} type="number" min={0} max={60} value={values.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} />}
        </Field>
      </div>
      <Field id="guide-phone" label="Phone" hint="Only shared with travelers after you accept their request." error={errors.phone}>
        {(aria) => <Input {...aria} type="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} />}
      </Field>
      <fieldset>
        <legend className="text-sm font-medium text-ink">
          Where you guide<span className="text-danger-ink" aria-hidden="true"> *</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {destinations.map((destination) => (
            <label key={destination.id} className="flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-sm has-[:checked]:border-link has-[:checked]:bg-brand-soft">
              <input type="checkbox" checked={values.areaIds.includes(destination.id)} onChange={() => toggleArea(destination.id)} className="accent-brand-700" />
              {destination.name}
            </label>
          ))}
        </div>
        {errors.areaIds ? <p className="mt-1 text-xs font-medium text-danger-ink">{errors.areaIds[0]}</p> : null}
      </fieldset>
      <FormMessage>{formError}</FormMessage>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : profile ? "Save profile" : "Send application"}
      </Button>
    </form>
  );
}
