import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (_req, res) => {
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

  res.json({ total, pending, inProgress, resolved });
});

router.get("/stats/by-category", async (_req, res) => {
  const rows = await db
    .select({
      category: reportsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.category)
    .orderBy(sql`count(*) desc`);

  res.json(rows);
});

router.get("/stats/by-status", async (_req, res) => {
  const rows = await db
    .select({
      status: reportsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.status);

  res.json(rows);
});

router.get("/stats/recent", async (_req, res) => {
  const rows = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(5);

  res.json(rows);
});

export default router;
