import { db, reportsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Allow", ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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

    return res.status(200).json({ total, pending, inProgress, resolved });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
