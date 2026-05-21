import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, reportsTable, and, desc, eq, like } from "@workspace/db";
import { CreateReportBody, ListReportsQueryParams } from "@workspace/api-zod";
import { setCorsHeaders } from "./_cors";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();

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

    const parsed = CreateReportBody.safeParse(req.body);
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
