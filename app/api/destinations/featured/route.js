import { featuredDestinationsController } from "@/lib/controllers/destination.controller";

export async function GET(request) {
  return featuredDestinationsController(request);
}
