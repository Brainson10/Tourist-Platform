"use client";

/** A fieldset of checkbox "chips" for choosing several values from a short list. */
export function CheckboxChips({ legend, hint, options, selected, onChange, error, className = "sm:col-span-2" }) {
  function toggle(value) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  return (
    <fieldset className={className}>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-1.5 text-sm has-[:checked]:border-link has-[:checked]:bg-brand-soft">
            <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)} className="accent-brand-700" />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-danger-ink">{Array.isArray(error) ? error[0] : error}</p> : null}
    </fieldset>
  );
}
