import { requireAdminUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { ADMIN_REGISTRY, getResourceHandler } from "@/lib/services/admin.service";
import { adminResourceIdParamSchema } from "@/lib/validators/admin";

export const GET = withErrorHandling(async (_request, { params }) => {
  await requireAdminUser();
  const { resource, id } = validate(adminResourceIdParamSchema, await params);

  return successResponse(await getResourceHandler(resource, "get")(id), { message: "Loaded" });
});

async function update(request, { params }) {
  const admin = await requireAdminUser();
  const { resource, id } = validate(adminResourceIdParamSchema, await params);
  const handler = getResourceHandler(resource, "update");
  const input = validate(ADMIN_REGISTRY[resource].schema, await readJsonBody(request));

  return successResponse(await handler(id, input, admin), { message: "Saved" });
}

export const PUT = withErrorHandling(update);
export const PATCH = withErrorHandling(update);

export const DELETE = withErrorHandling(async (_request, { params }) => {
  await requireAdminUser();
  const { resource, id } = validate(adminResourceIdParamSchema, await params);

  return successResponse(await getResourceHandler(resource, "remove")(id), { message: "Deleted" });
});
