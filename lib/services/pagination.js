export function getPagination(query = {}, defaultLimit = 12) {
  const page = query.page ?? 1;
  const limit = query.limit ?? defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
