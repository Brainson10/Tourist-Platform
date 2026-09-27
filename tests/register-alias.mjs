// Lets `node --test` resolve the "@/..." import alias used across the app.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { existsSync } from "node:fs";
      import { pathToFileURL } from "node:url";
      const root = ${JSON.stringify(process.cwd())};
      export async function resolve(specifier, context, next) {
        if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
        if (specifier.startsWith("@/")) {
          const base = root + "/" + specifier.slice(2);
          const file = [base, base + ".js", base + "/index.js"].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
          return next(pathToFileURL(file ?? base).href, context);
        }
        return next(specifier, context);
      }
    `),
  import.meta.url
);
