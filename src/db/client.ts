// src/db/client.ts
//
// M3 T2 — Singleton Drizzle client for the state service.
// API routes (src/pages/api/*) import `db` from here so the whole
// process shares one better-sqlite3 connection.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const DB_PATH = process.env.CS300_DB_PATH ?? 'data/cs-300.db';

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
