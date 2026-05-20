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

export * from "./schema/index.js";
