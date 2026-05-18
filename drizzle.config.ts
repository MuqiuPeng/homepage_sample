import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Match Next.js convention: prefer .env.local, fall back to .env.
config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

// Same SSL strategy as `lib/db/index.ts` (see comment there for details).
// Drizzle Kit has its own connection layer, so config is repeated here.
const isLocal = /(localhost|127\.0\.0\.1)/.test(url);
const ssl = isLocal ? false : "require";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url, ssl },
  strict: true,
  verbose: true,
} satisfies Config;
