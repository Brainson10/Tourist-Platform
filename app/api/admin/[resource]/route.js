import {
  createAdminResourceController,
  listAdminResourceController,
} from "@/lib/controllers/admin.controller";

export async function GET(request, context) {
  return listAdminResourceController(request, context);
}

export async function POST(request, context) {
  return createAdminResourceController(request, context);
}
