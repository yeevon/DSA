// drizzle.config.ts
//
// M3 T2 — Drizzle Kit config for the cs-300 state service.
// Schema lives at src/db/schema.ts; migrations checked in under
// drizzle/; SQLite file at data/cs-300.db (gitignored — per-dev).

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: 'data/cs-300.db',
  },
  verbose: true,
  strict: true,
});
