"use client";

import Link from "next/link";
import { Input } from "@/components/ui/field";
import { SELLER_KINDS, labelOf } from "@/lib/constants/souvenirs";

/** Choose where a souvenir can be bought, with an optional tip per place. */
export function SellerPicker({ sellers, value, onChange, error }) {
  const chosen = new Map(value.map((entry) => [entry.sellerId, entry]));

  function toggle(sellerId) {
    onChange(chosen.has(sellerId) ? value.filter((entry) => entry.sellerId !== sellerId) : [...value, { sellerId, note: "" }]);
  }

  function setNote(sellerId, note) {
    onChange(value.map((entry) => (entry.sellerId === sellerId ? { ...entry, note } : entry)));
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-medium text-ink">Places to buy</legend>
      <p className="text-xs text-ink-subtle">
        Each place is pinned on the souvenir&apos;s map with directions.{" "}
        <Link href="/admin/sellers" className="font-medium text-link hover:underline">
          Add or edit places
        </Link>
      </p>
      {sellers.length ? (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
          {sellers.map((seller) => {
            const entry = chosen.get(seller.id);
            return (
              <li key={seller.id} className="p-3">
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input type="checkbox" checked={Boolean(entry)} onChange={() => toggle(seller.id)} className="mt-0.5 h-4 w-4 accent-brand-700" />
                  <span>
                    <span className="font-medium">{seller.name}</span>
                    <span className="block text-xs text-ink-muted">
                      {labelOf(SELLER_KINDS, seller.kind)}
                      {seller.village ? ` · ${seller.village.name}, ${seller.village.state}` : ""}
                    </span>
                  </span>
                </label>
                {entry ? (
                  <div className="mt-2 pl-6">
                    <label htmlFor={`seller-note-${seller.id}`} className="sr-only">
                      Tip for buying at {seller.name}
                    </label>
                    <Input id={`seller-note-${seller.id}`} value={entry.note ?? ""} maxLength={200} placeholder="Tip for travelers (optional), e.g. ask for natural dyes" className="py-1.5 text-xs" onChange={(event) => setNote(seller.id, event.target.value)} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-line-strong px-4 py-5 text-center text-sm text-ink-subtle">No places added yet. You can link them later.</p>
      )}
      {error ? <p className="mt-1 text-xs font-medium text-danger-ink">{Array.isArray(error) ? error[0] : error}</p> : null}
    </fieldset>
  );
}
