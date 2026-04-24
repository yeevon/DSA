// src/pages/api/health.ts
//
// M3 T3 + T4 — health probe used by detectMode() (T5) to decide
// whether the local state service is reachable. Returns
// {ok, version, db, seeded}. `db: 'ok'` if Drizzle's better-sqlite3
// client can run SELECT 1.
//
// First GET per process triggers the seed (T4) — chapters + sections
// upserted from scripts/chapters.json + lectures/*.mdx frontmatter.
// Subsequent GETs skip via a process-local guard (idempotent anyway,
// but no point re-doing the work). On seed failure, health still
// returns 200 — `seeded: false` flags the issue without breaking
// detectMode()'s probe.

import type { APIRoute } from 'astro';
import { sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { seed, type SeedResult } from '../../lib/seed';

export const prerender = false;

let seededResult: SeedResult | null = null;
let seedError: string | null = null;

export const GET: APIRoute = async () => {
  let dbStatus: 'ok' | 'error' = 'ok';
  try {
    db.run(sql`SELECT 1`);
  } catch {
    dbStatus = 'error';
  }

  if (seededResult === null && seedError === null) {
    try {
      seededResult = seed();
    } catch (err) {
      seedError = err instanceof Error ? err.message : String(err);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      version: '0.0.1',
      db: dbStatus,
      seeded: seededResult,
      seed_error: seedError,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
