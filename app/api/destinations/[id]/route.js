import {
  deleteDestinationController,
  getDestinationController,
  updateDestinationController,
} from "@/lib/controllers/destination.controller";

export async function GET(request, context) {
  return getDestinationController(request, context);
}

export async function PUT(request, context) {
  return updateDestinationController(request, context);
}

export async function PATCH(request, context) {
  return updateDestinationController(request, context);
}

export async function DELETE(request, context) {
  return deleteDestinationController(request, context);
}
