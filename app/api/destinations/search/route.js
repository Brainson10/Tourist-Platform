import { searchDestinationsController } from "@/lib/controllers/destination.controller";

export async function GET(request) {
  return searchDestinationsController(request);
}
