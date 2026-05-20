import { db, reportsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

export async function getStatsSummary() {
  const rows = await db
    .select({
      status: reportsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.status);

  let total = 0;
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;

  for (const row of rows) {
    total += row.count;
    if (row.status === "Pending") pending = row.count;
    else if (row.status === "In Progress") inProgress = row.count;
    else if (row.status === "Resolved") resolved = row.count;
  }

  return { total, pending, inProgress, resolved };
}

export async function getStatsByCategory() {
  return db
    .select({
      category: reportsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.category)
    .orderBy(sql`count(*) desc`);
}

export async function getStatsByStatus() {
  return db
    .select({
      status: reportsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.status);
}

export async function getRecentActivity() {
  return db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(5);
}
