import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { badRequest } from "@/lib/api/errors";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import {
  adminListQuerySchema,
  adminResourceIdParamSchema,
  adminResourceParamSchema,
  createSchemas,
  updateSchemas,
} from "@/lib/validators/admin-cms";
import {
  createAdminResource,
  deleteAdminResource,
  getAdminDashboardStats,
  getAdminOptions,
  getAdminResourceById,
  listAdminResource,
  updateAdminResource,
} from "@/lib/services/admin.service";

export async function adminStatsController() {
  try {
    await requireAdminUser();

    const [stats, options] = await Promise.all([getAdminDashboardStats(), getAdminOptions()]);

    return successResponse({ stats, options }, { message: "Admin dashboard retrieved successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function listAdminResourceController(request, { params }) {
  try {
    await requireAdminUser();

    const { resource } = validate(adminResourceParamSchema, await params);
    const query = validate(adminListQuerySchema, getQueryParams(request));
    const result = await listAdminResource(resource, query);

    return successResponse(result.data, {
      message: "Admin resource retrieved successfully",
      meta: result.meta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createAdminResourceController(request, { params }) {
  try {
    await requireAdminUser();

    const { resource } = validate(adminResourceParamSchema, await params);
    const schema = createSchemas[resource];

    if (!schema) {
      throw badRequest("Unsupported create operation");
    }

    const body = validate(schema, await readJsonBody(request));
    const item = await createAdminResource(resource, body);

    return successResponse(item, {
      status: 201,
      message: "Admin resource created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getAdminResourceController(_request, { params }) {
  try {
    await requireAdminUser();

    const { resource, id } = validate(adminResourceIdParamSchema, await params);
    const item = await getAdminResourceById(resource, id);

    return successResponse(item, { message: "Admin resource retrieved successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateAdminResourceController(request, { params }) {
  try {
    await requireAdminUser();

    const { resource, id } = validate(adminResourceIdParamSchema, await params);
    const schema = updateSchemas[resource];

    if (!schema) {
      throw badRequest("Unsupported update operation");
    }

    const body = validate(schema, await readJsonBody(request));
    const item = await updateAdminResource(resource, id, body);

    return successResponse(item, { message: "Admin resource updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteAdminResourceController(_request, { params }) {
  try {
    await requireAdminUser();

    const { resource, id } = validate(adminResourceIdParamSchema, await params);
    const item = await deleteAdminResource(resource, id);

    return successResponse(item, { message: "Admin resource deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
