import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

type DbGlobal = typeof globalThis & {
  __smartMbararaPool?: pg.Pool;
  __smartMbararaDb?: ReturnType<typeof drizzle<typeof schema>>;
};

const globalForDb = globalThis as DbGlobal;

export const pool =
  globalForDb.__smartMbararaPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

export const db =
  globalForDb.__smartMbararaDb ?? drizzle(pool, { schema });

globalForDb.__smartMbararaPool = pool;
globalForDb.__smartMbararaDb = db;

import { and, desc, eq, like, sql } from "drizzle-orm";

export * from "./schema/index.js";
export { and, desc, eq, like, sql };

// expose schema and common query helpers on the shared `db` instance so
// downstream code can import only `db` and reference `db.reportsTable`,
// `db.eq`, etc. This ensures a single drizzle-orm instance is used.
export const reportsTable = schema.reportsTable;
Object.assign(db as unknown as Record<string, unknown>, {
  reportsTable,
  and,
  desc,
  eq,
  like,
  sql,
});
