import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import {
  createDestinationSchema,
  destinationIdParamSchema,
  destinationQuerySchema,
  destinationSearchSchema,
  destinationSlugOrIdParamSchema,
  nearbyDestinationQuerySchema,
  updateDestinationSchema,
} from "@/lib/validators/destination.validator";
import {
  createDestination,
  deleteDestination,
  getDestinationBySlugOrId,
  getFeaturedDestinations,
  getNearbyDestinations,
  listDestinationCollection,
  searchDestinations,
  updateDestination,
} from "@/lib/services/destination.service";

export async function listDestinationsController(request) {
  try {
    const query = validate(destinationQuerySchema, getQueryParams(request));
    const result = await listDestinationCollection(query);

    return successResponse(result.data, {
      message: "Destinations retrieved successfully",
      meta: result.meta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createDestinationController(request) {
  try {
    await requireAdminUser();

    const body = validate(createDestinationSchema, await readJsonBody(request));
    const destination = await createDestination(body);

    return successResponse(destination, {
      status: 201,
      message: "Destination created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getDestinationController(_request, { params }) {
  try {
    const { id } = validate(destinationSlugOrIdParamSchema, await params);
    const destination = await getDestinationBySlugOrId(id);

    return successResponse(destination, {
      message: "Destination retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateDestinationController(request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(destinationIdParamSchema, await params);
    const body = validate(updateDestinationSchema, await readJsonBody(request));
    const destination = await updateDestination(id, body);

    return successResponse(destination, {
      message: "Destination updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteDestinationController(_request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(destinationIdParamSchema, await params);
    const destination = await deleteDestination(id);

    return successResponse(destination, {
      message: "Destination deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function featuredDestinationsController(request) {
  try {
    const query = validate(destinationQuerySchema.pick({ limit: true }), getQueryParams(request));
    const destinations = await getFeaturedDestinations(query.limit ?? 10);

    return successResponse(destinations, {
      message: "Featured destinations retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchDestinationsController(request) {
  try {
    const query = validate(destinationSearchSchema, getQueryParams(request));
    const result = await searchDestinations(query);

    return successResponse(result.results, {
      message: "Destination search completed successfully",
      meta: result.meta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function nearbyDestinationsController(request) {
  try {
    const query = validate(nearbyDestinationQuerySchema, getQueryParams(request));
    const destinations = await getNearbyDestinations(query);

    return successResponse(destinations, {
      message: "Nearby destinations retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
