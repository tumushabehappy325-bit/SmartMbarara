import { db } from "@workspace/db";
import {
  UpdateReportStatusBody,
  UpdateReportStatusParams,
} from "@workspace/api-zod";

type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  params?: { id?: string };
  body?: unknown;
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

function parseBody(body: unknown) {
  if (typeof body !== "string") return body;
  if (!body.trim()) return {};
  return JSON.parse(body);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Allow", ["PATCH", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const idStr = req.params?.id ?? getQueryValue(req.query?.id);
  const reportId = Number(idStr);

  if (Number.isNaN(reportId)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const paramsParsed = UpdateReportStatusParams.safeParse({ id: reportId });
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const bodyParsed = UpdateReportStatusBody.safeParse(parseBody(req.body));
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" });
    }

    const _db = db as unknown as any;
    const reportsTable = _db.reportsTable;
    const eq = _db.eq;

    const _db = db as unknown as any;
    const reportsTable = _db.reportsTable;
    const eq = _db.eq;

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
