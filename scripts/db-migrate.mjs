#!/usr/bin/env node
// scripts/db-migrate.mjs
//
// M3 T2 — Apply Drizzle migrations programmatically.
// `drizzle-kit push` needs a TTY; this script does the same job
// non-interactively for CI / fresh-clone setup.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.CS300_DB_PATH ?? 'data/cs-300.db';

mkdirSync(dirname(DB_PATH), { recursive: true });
const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });
console.log(`[db-migrate] applied migrations to ${DB_PATH}`);
sqlite.close();
