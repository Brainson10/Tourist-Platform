"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

/** Edits a list of small records, e.g. hotels or emergency contacts. */
export function RecordListEditor({ legend, fields, records, onChange, emptyRecord, addLabel }) {
  function update(index, name, value) {
    onChange(records.map((record, position) => (position === index ? { ...record, [name]: value } : record)));
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 space-y-3">
        {records.map((record, index) => (
          <div key={index} className="grid gap-2 rounded-lg border border-line bg-surface-muted p-3 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className="text-xs font-medium text-ink-muted">
                {field.label}
                {field.required ? <span className="text-danger-ink"> *</span> : null}
                <Input className="mt-1" value={record[field.name] ?? ""} placeholder={field.placeholder} onChange={(event) => update(index, field.name, event.target.value)} />
              </label>
            ))}
            <div className="flex items-end justify-end sm:col-span-2">
              <Button size="sm" variant="danger-ghost" onClick={() => onChange(records.filter((_, position) => position !== index))}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" variant="secondary" className="mt-2" onClick={() => onChange([...records, { ...emptyRecord }])}>
        ＋ {addLabel}
      </Button>
    </fieldset>
  );
}
