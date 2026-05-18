import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { SUPABASE_ROOT_CA_2021 } from "./supabase-ca";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Did you copy .env.example to .env.local?",
  );
}

/**
 * SSL strategy
 * ------------
 * - Local Docker (`localhost`/`127.0.0.1`): no SSL — local Postgres isn't
 *   configured for it.
 * - Anything else (Supabase, prod): TLS-encrypted connection.
 *
 * NOTE: Supabase serves the Postgres TLS cert chain without the
 * Intermediate 2021 CA, so even with our embedded Root CA, full chain
 * verification fails (`self-signed certificate in certificate chain`).
 * We fall back to `'require'` — encrypted but doesn't verify the chain.
 * Acceptable for our build-time SSG queries; if Supabase later fixes their
 * chain delivery, swap back to `{ ca: SUPABASE_ROOT_CA_2021, rejectUnauthorized: true }`.
 */
void SUPABASE_ROOT_CA_2021; // kept for future verify-full switch-back
const isLocal = /(localhost|127\.0\.0\.1)/.test(url);
const ssl = isLocal ? (false as const) : ("require" as const);

// `max: 1` — keep the connection pool small in serverless / Next.js dev.
// Bump when running heavy parallel ingest in standalone scripts.
const client = postgres(url, { max: 1, ssl });

export const db = drizzle(client, { schema });
export { schema };
