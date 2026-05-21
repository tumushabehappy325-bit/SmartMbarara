import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, reportsTable, eq } from "@workspace/db";
import {
  UpdateReportStatusBody,
  UpdateReportStatusParams,
} from "@workspace/api-zod";
import { setCorsHeaders } from "../../_cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  res.setHeader("Allow", ["PATCH", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const reportId = Number(req.query.id);

  if (Number.isNaN(reportId)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const paramsParsed = UpdateReportStatusParams.safeParse({ id: reportId });
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const bodyParsed = UpdateReportStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" });
    }

    const [report] = await db
      .update(reportsTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(reportsTable.id, paramsParsed.data.id))
      .returning();

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
