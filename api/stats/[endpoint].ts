import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, reportsTable, desc, sql } from "@workspace/db";
import { setCorsHeaders } from "../_cors";

async function getStatsSummary() {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  res.setHeader("Allow", ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const endpoint = req.query.endpoint as string;

    if (endpoint === "summary") {
      return res.status(200).json(await getStatsSummary());
    }

    if (endpoint === "by-category") {
      const rows = await db
        .select({
          category: reportsTable.category,
          count: sql<number>`count(*)::int`,
        })
        .from(reportsTable)
        .groupBy(reportsTable.category)
        .orderBy(sql`count(*) desc`);

      return res.status(200).json(rows);
    }

    if (endpoint === "by-status") {
      const rows = await db
        .select({
          status: reportsTable.status,
          count: sql<number>`count(*)::int`,
        })
        .from(reportsTable)
        .groupBy(reportsTable.status);

      return res.status(200).json(rows);
    }

    if (endpoint === "recent") {
      const rows = await db
        .select()
        .from(reportsTable)
        .orderBy(desc(reportsTable.createdAt))
        .limit(5);

      return res.status(200).json(rows);
    }

    return res.status(404).json({ error: "Stats endpoint not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
