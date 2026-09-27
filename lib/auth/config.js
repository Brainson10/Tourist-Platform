import "server-only";
import bcrypt from "bcryptjs";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/db";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || baseURL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  appName: "Smart Tourism",
  baseURL,
  // Better Auth refuses to start in production without a real secret.
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    fields: {
      name: "fullName",
      image: "avatar",
    },
    additionalFields: {
      // input: false means clients can never set these through Better Auth endpoints.
      role: { type: "string", required: false, defaultValue: "TOURIST", input: false },
      isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
      phone: { type: "string", required: false, input: true },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Existing accounts were created with bcrypt, so keep bcrypt for compatibility.
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // Disabled so role changes and account blocks take effect immediately.
    cookieCache: { enabled: false },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isBlocked: true },
          });

          if (!user || user.isBlocked) {
            throw new APIError("FORBIDDEN", {
              message: "This account has been suspended. Contact support if you think this is a mistake.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
