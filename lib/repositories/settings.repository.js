import prisma from "@/lib/db";

const SETTINGS_KEY = "platform";

export async function readSettings() {
  const row = await prisma.platformSetting.findUnique({ where: { key: SETTINGS_KEY } });
  return row?.value ?? null;
}

export async function writeSettings(value) {
  const row = await prisma.platformSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value },
    create: { key: SETTINGS_KEY, value },
  });

  return row.value;
}
