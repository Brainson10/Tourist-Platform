import { nearbyDestinationsController } from "@/lib/controllers/destination.controller";

export async function GET(request) {
  return nearbyDestinationsController(request);
}
