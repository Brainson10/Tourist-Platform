import { createDestinationController, listDestinationsController } from "@/lib/controllers/destination.controller";

export async function GET(request) {
  return listDestinationsController(request);
}

export async function POST(request) {
  return createDestinationController(request);
}
