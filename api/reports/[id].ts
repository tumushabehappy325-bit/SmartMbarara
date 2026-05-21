import { db, reportsTable, eq } from "@workspace/db";
import {
  GetReportParams,
  UpdateReportBody,
  UpdateReportParams,
} from "@workspace/api-zod";
import { setCorsHeaders } from "../_cors";

type Req = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
};

export default async function handler(req: Req, res: Res) {
  setCorsHeaders(res);
  res.setHeader("Allow", ["GET", "PATCH", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id);

  try {
    if (req.method === "GET") {
      const parsed = GetReportParams.safeParse({ id });
      if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

      const [report] = await db
        .select()
        .from(reportsTable)
        .where(eq(reportsTable.id, parsed.data.id));

      if (!report) return res.status(404).json({ error: "Report not found" });
      return res.status(200).json(report);
    }

    const paramsParsed = UpdateReportParams.safeParse({ id });
    if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

    const bodyParsed = UpdateReportBody.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ error: "Validation failed" });

    const updates: Partial<typeof reportsTable.$inferInsert> = {};
    if (bodyParsed.data.status) updates.status = bodyParsed.data.status;
    if (bodyParsed.data.description) updates.description = bodyParsed.data.description;

    const [report] = await db
      .update(reportsTable)
      .set(updates)
      .where(eq(reportsTable.id, paramsParsed.data.id))
      .returning();

    if (!report) return res.status(404).json({ error: "Report not found" });
    return res.status(200).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
