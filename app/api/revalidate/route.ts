import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Event-driven ISR endpoint.
 *
 * Supabase Database Webhooks POST here whenever a row in `categories`,
 * `series`, or `variants` is inserted / updated / deleted. We purge the catalog
 * page caches so the *next* visitor renders fresh data — no time-based polling.
 *
 * Auth: a shared secret sent as the `x-revalidate-secret` header. Put the same
 * value in `REVALIDATE_SECRET` (server env) and in the Supabase webhook's HTTP
 * headers. Without it the request is rejected with 401.
 */

// Route templates whose cached output is derived from the catalog tables.
// Passing the dynamic template + "page" revalidates every instance of that
// route (all locales, all category / series ids) in one call.
const CATALOG_ROUTES = [
  "/[locale]",
  "/[locale]/products",
  "/[locale]/products/[categoryId]",
  "/[locale]/products/[categoryId]/[seriesId]",
] as const;

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not set on the server" },
      { status: 500 },
    );
  }
  if (request.headers.get("x-revalidate-secret") !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Best-effort: note which table / event triggered this (Supabase webhook
  // body). We revalidate the whole catalog regardless — the site is small and
  // this keeps the logic robust against partial payloads.
  let trigger: { table?: string; type?: string } = {};
  try {
    const body = await request.json();
    trigger = { table: body?.table, type: body?.type };
  } catch {
    // No / non-JSON body (e.g. a manual ping) — fine, revalidate anyway.
  }

  for (const route of CATALOG_ROUTES) {
    revalidatePath(route, "page");
  }

  return NextResponse.json({ ok: true, trigger, revalidated: CATALOG_ROUTES });
}
