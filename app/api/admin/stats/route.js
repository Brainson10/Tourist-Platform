import { adminStatsController } from "@/lib/controllers/admin.controller";

export async function GET(request) {
  return adminStatsController(request);
}
