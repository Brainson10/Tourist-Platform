import Link from "next/link";
import { AutoSubmitForm } from "@/components/ui/auto-submit-form";
import { Button } from "@/components/ui/button";
import { Select, inputClasses } from "@/components/ui/field";
import { pluralize } from "@/lib/utils/format";

/** Server-rendered search + filter bar; state lives in the URL. */
export function AdminToolbar({ basePath, query, filters = [], total, noun, preserve = {} }) {
  const active = Boolean(query.search || filters.some((filter) => query[filter.name] !== undefined));

  return (
    <div className="mb-4 space-y-2">
      <AutoSubmitForm action={basePath} role="search" className="flex flex-wrap gap-2">
        {Object.entries(preserve).map(([name, value]) => (value ? <input key={name} type="hidden" name={name} value={value} /> : null))}
        <label htmlFor="admin-search" className="sr-only">
          Search
        </label>
        <input id="admin-search" name="search" type="search" defaultValue={query.search ?? ""} placeholder="Search…" className={`${inputClasses} max-w-xs`} />
        {filters.map((filter) => (
          <div key={filter.name}>
            <label htmlFor={`filter-${filter.name}`} className="sr-only">
              {filter.label}
            </label>
            <Select id={`filter-${filter.name}`} name={filter.name} defaultValue={query[filter.name] === undefined ? "" : String(query[filter.name])} className="w-auto">
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {active ? (
          <Link href={basePath} className="self-center text-sm font-medium text-link hover:underline">
            Clear
          </Link>
        ) : null}
      </AutoSubmitForm>
      <p className="text-sm text-ink-muted">{pluralize(total, noun)}</p>
    </div>
  );
}
