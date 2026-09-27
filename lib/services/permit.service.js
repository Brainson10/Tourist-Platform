import { cache } from "react";
import * as permitRepository from "@/lib/repositories/permit.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

/** Entry permit rules for a state, or null when none are recorded. Never throws. */
export const getPermitForState = cache(async (state) => {
  if (!state) return null;

  try {
    return await permitRepository.findPermitByState(state);
  } catch (error) {
    console.error("[permits] lookup failed", error);
    return null;
  }
});

export async function listPermits(query = {}) {
  const { page, limit, skip } = getPagination(query, 50);
  const { items, total } = await permitRepository.listPermits({ ...query, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export function createPermit(input) {
  return permitRepository.createPermit(input);
}

export function updatePermit(id, input) {
  return permitRepository.updatePermit(id, input);
}

export function deletePermit(id) {
  return permitRepository.deletePermit(id);
}
