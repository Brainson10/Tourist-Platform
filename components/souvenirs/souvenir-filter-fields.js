import { Select } from "@/components/ui/field";
import { AUDIENCES, BUDGET_BANDS, QUALITIES, toParam } from "@/lib/constants/souvenirs";

function FilterSelect({ id, name, label, value, allLabel, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value ?? ""}>
        <option value="">{allLabel}</option>
        {children}
      </Select>
    </div>
  );
}

const options = (list, toValue = (value) => value) =>
  list.map((entry) => (
    <option key={entry.value} value={toValue(entry.value)}>
      {entry.label}
    </option>
  ));

/**
 * The /souvenirs filter controls (no <form>): rendered in the desktop sidebar and the mobile sheet,
 * so ids take a prefix to stay unique. Values mirror the URL params.
 */
export function SouvenirFilterFields({ idPrefix, query, filterOptions }) {
  const groups = query.state ? filterOptions.destinationGroups.filter((group) => group.state.toLowerCase() === query.state.toLowerCase()) : filterOptions.destinationGroups;

  return (
    <div className="grid gap-4">
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.interest ? <input type="hidden" name="interest" value={toParam(query.interest)} /> : null}
      <FilterSelect id={`${idPrefix}-state`} name="state" label="State" value={query.state} allLabel="All of Northeast India">
        {filterOptions.destinationGroups.map((group) => (
          <option key={group.state} value={group.state}>
            {group.state}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect id={`${idPrefix}-destination`} name="destination" label="Destination" value={query.destination} allLabel="Any destination">
        {groups.map((group) => (
          <optgroup key={group.state} label={group.state}>
            {group.destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </optgroup>
        ))}
      </FilterSelect>
      <FilterSelect id={`${idPrefix}-category`} name="category" label="Category" value={query.category} allLabel="All categories">
        {filterOptions.categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect id={`${idPrefix}-budget`} name="budget" label="Budget" value={query.budget} allLabel="Any budget">
        {options(BUDGET_BANDS)}
      </FilterSelect>
      <FilterSelect id={`${idPrefix}-for`} name="for" label="Best for" value={query.for ? toParam(query.for) : ""} allLabel="Anyone">
        {options(AUDIENCES, toParam)}
      </FilterSelect>
      <FilterSelect id={`${idPrefix}-quality`} name="quality" label="Type" value={query.quality ? toParam(query.quality) : ""} allLabel="Any type">
        {options(QUALITIES, toParam)}
      </FilterSelect>
    </div>
  );
}
