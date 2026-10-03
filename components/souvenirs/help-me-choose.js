"use client";

import { Gift } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { SouvenirCard } from "@/components/cards/souvenir-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Skeleton } from "@/components/ui/states";
import { AUDIENCES, BUDGET_BANDS, INTERESTS, toParam } from "@/lib/constants/souvenirs";
import { apiRequest } from "@/lib/utils/api-client";
import { withQuery } from "@/lib/utils/query-string";

const QUESTIONS = [
  { key: "for", title: "Who is it for?", options: AUDIENCES },
  { key: "budget", title: "Budget?", options: BUDGET_BANDS },
  { key: "interest", title: "What interests you?", options: INTERESTS },
];

function ChipGroup({ question, value, onChange }) {
  const headingId = useId();

  return (
    <div role="group" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-sm font-semibold text-ink">
        {question.title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {question.options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : option.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                selected ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-surface text-ink-muted hover:border-ink-subtle hover:text-ink"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "Help me choose": three quick questions, then ranked ideas with the reasons for each.
 * Scoped to a destination (and its state) when one is given, otherwise to `state` or everywhere.
 */
export function HelpMeChoose({ destination = null, state = null, framed = true }) {
  const [answers, setAnswers] = useState({ for: null, budget: null, interest: null });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const place = destination?.state ?? state;

  async function showIdeas() {
    setStatus("loading");
    const url = withQuery("/api/souvenirs/recommend", {
      destination: destination?.slug,
      state: destination ? undefined : state,
      budget: answers.budget,
      for: answers.for ? toParam(answers.for) : undefined,
      interest: answers.interest ? toParam(answers.interest) : undefined,
    });
    const response = await apiRequest(url);

    if (!response.ok) {
      setError(response.message);
      setStatus("error");
      return;
    }

    setResult(response.data);
    setStatus("done");
  }

  function reset() {
    setAnswers({ for: null, budget: null, interest: null });
    setResult(null);
    setStatus("idle");
  }

  return (
    <div className={cn(framed && "rounded-2xl border border-line bg-surface p-5 sm:p-6")}>
      {framed ? (
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Not sure what to take home?</h2>
            <p className="text-sm text-ink-muted">Answer up to three questions and we&apos;ll suggest {place ? `treasures from ${place}` : "local treasures"} — with the reasons why.</p>
          </div>
        </div>
      ) : null}

      <div className={cn("grid gap-5", framed && "mt-5")}>
        {QUESTIONS.map((question) => (
          <ChipGroup key={question.key} question={question} value={answers[question.key]} onChange={(value) => setAnswers((current) => ({ ...current, [question.key]: value }))} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={showIdeas} disabled={status === "loading"}>
          {status === "loading" ? "Finding ideas…" : status === "done" ? "Update ideas" : "Show ideas"}
        </Button>
        {status === "done" || status === "error" ? (
          <Button variant="ghost" onClick={reset}>
            Start over
          </Button>
        ) : null}
      </div>

      <div aria-live="polite" className="mt-5">
        {status === "loading" ? (
          <div className="grid gap-5 sm:grid-cols-2" aria-busy="true">
            {[0, 1].map((index) => (
              <div key={index}>
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : null}

        {status === "error" ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink">{error}</p> : null}

        {status === "done" && result ? (
          result.results.length ? (
            <>
              <p className="text-sm font-medium text-ink">
                {result.results.length === 1 ? "1 idea" : `${result.results.length} ideas`}
                {result.state ? ` from ${result.state}` : ""}, best match first
              </p>
              <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {result.results.map((souvenir) => (
                  <SouvenirCard key={souvenir.id} souvenir={souvenir} reasons={souvenir.reasons} audience={answers.for} />
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
              Nothing matches all of that yet. Try a different budget, or{" "}
              <Link href={withQuery("/souvenirs", { destination: destination?.slug, state: destination ? undefined : state })} className="font-medium text-link hover:underline">
                browse every local treasure
              </Link>
              .
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
