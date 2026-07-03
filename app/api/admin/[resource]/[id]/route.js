import {
  deleteAdminResourceController,
  getAdminResourceController,
  updateAdminResourceController,
} from "@/lib/controllers/admin.controller";

export async function GET(request, context) {
  return getAdminResourceController(request, context);
}

export async function PATCH(request, context) {
  return updateAdminResourceController(request, context);
}

export async function DELETE(request, context) {
  return deleteAdminResourceController(request, context);
}
