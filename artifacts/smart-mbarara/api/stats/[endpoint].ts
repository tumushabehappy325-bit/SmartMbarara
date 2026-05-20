import { db, reportsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
};

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Allow", ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const endpoint = getQueryValue(req.query.endpoint);

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
