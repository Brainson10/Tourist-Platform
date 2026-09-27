"use client";

import { useState } from "react";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { slugify } from "@/lib/utils/slugify";

export function ResourceForm({ config, initialValues, options, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));

  function update(name, value) {
    setValues((current) => {
      const next = { ...current, [name]: value };

      for (const field of config.fields) {
        if (field.kind === "slug" && field.from === name && !slugTouched) next[field.name] = slugify(value);
      }

      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    const result = await onSubmit(values);
    setPending(false);

    if (result && !result.ok) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.message);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {config.fields.map((field) => {
        const id = `field-${field.name}`;
        const common = { id, label: field.label, required: field.required, hint: field.hint, error: errors[field.name] };
        const span = field.half ? "" : "sm:col-span-2";

        if (field.kind === "image") {
          return (
            <div key={field.name} className={span}>
              <ImageUrlField {...common} folder={field.folder} value={values[field.name]} onChange={(value) => update(field.name, value)} />
            </div>
          );
        }

        if (field.kind === "checkbox") {
          return (
            <label key={field.name} className={cn("flex items-center gap-2 text-sm text-ink", span)}>
              <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => update(field.name, event.target.checked)} className="h-4 w-4 accent-brand-700" />
              {field.label}
            </label>
          );
        }

        return (
          <Field key={field.name} {...common} className={span}>
            {(aria) => {
              if (field.kind === "textarea") {
                return <Textarea {...aria} rows={field.rows ?? 4} value={values[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)} />;
              }

              if (field.kind === "select") {
                const choices = typeof field.options === "string" ? options[field.options] ?? [] : field.options;

                return (
                  <Select {...aria} value={values[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)}>
                    {field.required && !values[field.name] ? <option value="">Choose…</option> : null}
                    {choices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </Select>
                );
              }

              return (
                <Input
                  {...aria}
                  type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
                  step={field.step}
                  value={values[field.name] ?? ""}
                  onChange={(event) => {
                    if (field.kind === "slug") setSlugTouched(true);
                    update(field.name, field.kind === "slug" ? slugify(event.target.value) : event.target.value);
                  }}
                />
              );
            }}
          </Field>
        );
      })}

      <div className="sm:col-span-2">
        <FormMessage>{formError}</FormMessage>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
