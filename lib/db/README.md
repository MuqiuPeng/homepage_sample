# Database setup

Local Postgres + Drizzle ORM. The product catalog in `data/products.json`
is the source of truth — `db:ingest` syncs it to Postgres.

## First-time setup

```bash
# 1. Copy env template (safe to commit `.env.example`, never commit `.env.local`)
cp .env.example .env.local

# 2. Start local Postgres in Docker
pnpm db:up

# 3. Push the schema (no migration files — direct sync, ideal for dev)
pnpm db:push

# 4. Load products.json into the DB
pnpm db:ingest
```

After this, the DB has 1 category, 1 series, 6 variants. Re-run `db:ingest`
any time `data/products.json` changes — it's idempotent.

## Daily commands

| Command | What it does |
|---|---|
| `pnpm db:up` | Start the Docker Postgres container |
| `pnpm db:down` | Stop it (data preserved in volume) |
| `pnpm db:reset` | Stop + delete volume + restart (wipes all data) |
| `pnpm db:push` | Push current `lib/db/schema.ts` to the DB without writing migration files |
| `pnpm db:generate` | Write a SQL migration for the current schema delta into `drizzle/` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio (web UI) at https://local.drizzle.studio |
| `pnpm db:ingest` | Sync `data/products.json` → DB (idempotent, removes orphans) |

## Dev vs. prod schema workflow

- **Dev**: `db:push` is fine — direct schema sync, no migration history.
- **Prod-bound**: switch to `db:generate` (commit the SQL) + `db:migrate`
  in deploy. Drizzle Kit handles both cleanly.

## Schema overview

Three tables, all FKs typed; everything translatable lives in JSONB.

```
categories  ─┐
             ├──< series  ──< variants
             │     ├─ specs_schema (JSONB)   defines the per-series spec keys
             │     └─ ...                    series-level metadata
             │
             └─ name_i18n etc. (JSONB)
```

- `categories.name_i18n: { zh, en }`
- `series.specs_schema: [{ key, label: { zh, en }, unit }]`
- `variants.specs: { [key]: string | { zh, en } | { zh: string[], en: string[] } | null }`

A GIN index on `variants.specs` makes filters like
`WHERE specs->>'fluorine_content' LIKE '25%'` fast as the catalog grows.

## Connection

Default for local Docker (matches `docker-compose.yml`):

```
DATABASE_URL=postgresql://homepage:homepage_dev@localhost:5433/homepage_sample
```

Port 5433 (not the standard 5432) is used to avoid colliding with any
system-installed Postgres.
