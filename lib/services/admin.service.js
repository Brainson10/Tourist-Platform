import { badRequest, notFoundError } from "@/lib/api/errors";
import * as adminRepository from "@/lib/repositories/admin.repository";

const DEFAULT_SETTINGS = {
  platformName: "Smart Tourism Experience Intelligence Platform",
  supportEmail: "support@tourism.local",
  defaultState: "Manipur",
  emergencyHelpline: "112",
};

function getPagination(query = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function ensureDestinationExists(destinationId) {
  if (!destinationId) {
    return;
  }

  const destinations = await adminRepository.listDestinationOptions();
  const exists = destinations.some((destination) => destination.id === destinationId);

  if (!exists) {
    throw notFoundError("Destination not found");
  }
}

function normalizeDates(resource, data) {
  if (resource !== "festivals") {
    return data;
  }

  return {
    ...data,
    ...(data.startDate ? { startDate: data.startDate } : {}),
    ...(data.endDate ? { endDate: data.endDate } : {}),
  };
}

export async function getAdminDashboardStats() {
  return adminRepository.countAdminStats();
}

export async function getAdminOptions() {
  return {
    destinations: await adminRepository.listDestinationOptions(),
  };
}

export async function getAdminSettings() {
  const settings = await adminRepository.getPlatformSettings();

  return settings?.value ?? DEFAULT_SETTINGS;
}

export async function saveAdminSettings(data) {
  const settings = await adminRepository.upsertPlatformSettings(data);

  return settings.value;
}

export async function listAdminResource(resource, query = {}) {
  if (resource === "settings") {
    const settings = await getAdminSettings();

    return {
      data: [settings],
      meta: buildMeta({ page: 1, limit: 1, total: 1 }),
    };
  }

  const { page, limit, skip } = getPagination(query);
  const where = adminRepository.buildResourceWhere(resource, query);
  const { items, total } = await adminRepository.listResource(resource, {
    where,
    skip,
    take: limit,
  });

  return {
    data: items,
    meta: buildMeta({ page, limit, total }),
  };
}

export async function getAdminResourceById(resource, id) {
  const item = await adminRepository.getResourceById(resource, id);

  if (!item) {
    throw notFoundError("Resource not found");
  }

  return item;
}

export async function createAdminResource(resource, data) {
  if (resource === "settings") {
    return saveAdminSettings(data);
  }

  if (["festivals", "experiences", "stories"].includes(resource)) {
    await ensureDestinationExists(data.destinationId);
  }

  if (["reviews", "users"].includes(resource)) {
    throw badRequest("This resource cannot be created from the admin CMS");
  }

  return adminRepository.createResource(resource, normalizeDates(resource, data));
}

export async function updateAdminResource(resource, id, data) {
  if (resource === "settings") {
    return saveAdminSettings(data);
  }

  await getAdminResourceById(resource, id);

  if (["festivals", "experiences", "stories"].includes(resource) && data.destinationId) {
    await ensureDestinationExists(data.destinationId);
  }

  return adminRepository.updateResource(resource, id, normalizeDates(resource, data));
}

export async function deleteAdminResource(resource, id) {
  if (["settings", "users"].includes(resource)) {
    throw badRequest("This resource cannot be deleted from the admin CMS");
  }

  await getAdminResourceById(resource, id);

  return adminRepository.deleteResource(resource, id);
}
