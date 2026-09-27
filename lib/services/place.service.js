import { conflictError } from "@/lib/api/errors";
import * as placeRepository from "@/lib/repositories/place.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

export async function listVillages(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const { items, total } = await placeRepository.listVillages({ ...query, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export function listAllVillages() {
  return placeRepository.listAllVillages();
}

export function createVillage(input) {
  return placeRepository.createVillage(input);
}

export function updateVillage(id, input) {
  return placeRepository.updateVillage(id, input);
}

export async function deleteVillage(id) {
  const count = await placeRepository.countVillageDestinations(id);

  if (count > 0) {
    throw conflictError(`This village has ${count} destination${count === 1 ? "" : "s"}. Move or delete them first.`);
  }

  return placeRepository.deleteVillage(id);
}

export async function listCategories(query = {}) {
  const { page, limit, skip } = getPagination(query, 50);
  const { items, total } = await placeRepository.listCategories({ ...query, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export function listAllCategories() {
  return placeRepository.listAllCategories();
}

export function createCategory(input) {
  return placeRepository.createCategory(input);
}

export function updateCategory(id, input) {
  return placeRepository.updateCategory(id, input);
}

export function deleteCategory(id) {
  return placeRepository.deleteCategory(id);
}

