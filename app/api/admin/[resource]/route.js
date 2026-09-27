import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { ADMIN_REGISTRY, getResourceHandler } from "@/lib/services/admin.service";
import { adminListQuerySchema, adminResourceParamSchema } from "@/lib/validators/admin";

export const GET = withErrorHandling(async (request, { params }) => {
  await requireAdminUser();
  const { resource } = validate(adminResourceParamSchema, await params);
  const query = validate(adminListQuerySchema, getQueryParams(request));
  const { data, meta } = await getResourceHandler(resource, "list")(query);

  return successResponse(data, { message: "Loaded", meta });
});

export const POST = withErrorHandling(async (request, { params }) => {
  const admin = await requireAdminUser();
  const { resource } = validate(adminResourceParamSchema, await params);
  const create = getResourceHandler(resource, "create");
  const input = validate(ADMIN_REGISTRY[resource].schema, await readJsonBody(request));

  return successResponse(await create(input, admin), { status: 201, message: "Created" });
});
