import { db, reportsTable } from "@workspace/db";
import {
  CreateReportBody,
  ListReportsQueryParams,
} from "@workspace/api-zod";
import { and, desc, eq, like } from "drizzle-orm";

type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
};

const DEPARTMENT_MAP: Record<string, string> = {
  "Waste Management": "City Council",
  Health: "Health Department",
  Education: "Education Office",
  Security: "Police",
  "Water Supply": "NWSC",
  Electricity: "UMEME",
  "Roads & Transport": "Works Department",
  Other: "General Authority",
};

function parseBody(body: unknown) {
  if (typeof body !== "string") return body;
  if (!body.trim()) return {};
  return JSON.parse(body);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (req.method === "GET") {
      const parsed = ListReportsQueryParams.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query params" });
      }

      const { category, status, search } = parsed.data;
      const conditions = [];
      if (category) conditions.push(eq(reportsTable.category, category));
      if (status) conditions.push(eq(reportsTable.status, status));
      if (search) conditions.push(like(reportsTable.description, `%${search}%`));

      const rows = await db
        .select()
        .from(reportsTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(reportsTable.createdAt));

      return res.status(200).json(rows);
    }

    const parsed = CreateReportBody.safeParse(parseBody(req.body));
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
    }

    const data = parsed.data;
    const department = DEPARTMENT_MAP[data.category] ?? "General Authority";

    const [report] = await db
      .insert(reportsTable)
      .values({
        name: data.name ?? null,
        phone: data.phone,
        category: data.category,
        description: data.description,
        imagePath: data.imagePath ?? null,
        location: data.location ?? null,
        status: "Pending",
        department,
      })
      .returning();

    return res.status(201).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
