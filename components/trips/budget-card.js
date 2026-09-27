import { Wallet } from "lucide-react";
import { formatRupees, pluralize } from "@/lib/utils/format";

export function BudgetCard({ budget }) {
  return (
    <section aria-labelledby="budget-title" className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-2">
        <Wallet aria-hidden="true" className="h-5 w-5 text-accent-500" />
        <h2 id="budget-title" className="font-semibold text-ink">
          Estimated budget
        </h2>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{formatRupees(budget.total)}</p>
      <p className="text-sm text-ink-muted">
        {pluralize(budget.travelers, "traveler")} · {pluralize(budget.days, "day")} · about {formatRupees(budget.perPerson)} each
      </p>
      <dl className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">
            Stay, food & local travel
            <span className="block text-xs text-ink-subtle">
              {formatRupees(budget.dailyBudget)} per person per day{budget.usesDefaultDaily ? " (typical estimate)" : ""}
            </span>
          </dt>
          <dd className="font-medium text-ink">{formatRupees(budget.dailyTotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Experiences</dt>
          <dd className="font-medium text-ink">{formatRupees(budget.experiencesTotal)}</dd>
        </div>
      </dl>
      {budget.unpricedExperiences ? (
        <p className="mt-2 text-xs text-ink-subtle">{pluralize(budget.unpricedExperiences, "experience")} without a listed price not included.</p>
      ) : null}
      <p className="mt-3 text-xs text-ink-subtle">A rough guide, not a quote. Set your own daily spend with “Edit trip”.</p>
    </section>
  );
}
