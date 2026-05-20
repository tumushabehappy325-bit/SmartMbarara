import { db, reportsTable } from "@workspace/db";
import {
  CreateReportBody,
  GetReportParams,
  ListReportsQueryParams,
  UpdateReportBody,
  UpdateReportParams,
  UpdateReportStatusBody,
  UpdateReportStatusParams,
} from "@workspace/api-zod";
import { and, desc, eq, like } from "drizzle-orm";

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

export async function listReports(query: unknown) {
  const parsed = ListReportsQueryParams.safeParse(query);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid query params" } };
  }

  const { category, status, search } = parsed.data;
  const conditions = [];
  if (category) conditions.push(eq(reportsTable.category, category));
  if (status) conditions.push(eq(reportsTable.status, status));
  if (search) {
    conditions.push(like(reportsTable.description, `%${search}%`));
  }

  const rows = await db
    .select()
    .from(reportsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.createdAt));

  return { status: 200, body: rows };
}

export async function createReport(body: unknown) {
  const parsed = CreateReportBody.safeParse(body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "Validation failed", details: parsed.error.issues },
    };
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

  return { status: 201, body: report };
}

export async function getReport(id: number) {
  const parsed = GetReportParams.safeParse({ id });
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid id" } };
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, parsed.data.id));

  if (!report) {
    return { status: 404, body: { error: "Report not found" } };
  }

  return { status: 200, body: report };
}

export async function updateReport(id: number, body: unknown) {
  const paramsParsed = UpdateReportParams.safeParse({ id });
  if (!paramsParsed.success) {
    return { status: 400, body: { error: "Invalid id" } };
  }

  const bodyParsed = UpdateReportBody.safeParse(body);
  if (!bodyParsed.success) {
    return { status: 400, body: { error: "Validation failed" } };
  }

  const updates: Partial<typeof reportsTable.$inferInsert> = {};
  if (bodyParsed.data.status) updates.status = bodyParsed.data.status;
  if (bodyParsed.data.description) updates.description = bodyParsed.data.description;

  const [report] = await db
    .update(reportsTable)
    .set(updates)
    .where(eq(reportsTable.id, paramsParsed.data.id))
    .returning();

  if (!report) {
    return { status: 404, body: { error: "Report not found" } };
  }

  return { status: 200, body: report };
}

export async function updateReportStatus(id: number, body: unknown) {
  const paramsParsed = UpdateReportStatusParams.safeParse({ id });
  if (!paramsParsed.success) {
    return { status: 400, body: { error: "Invalid id" } };
  }

  const bodyParsed = UpdateReportStatusBody.safeParse(body);
  if (!bodyParsed.success) {
    return { status: 400, body: { error: "Validation failed" } };
  }

  const [report] = await db
    .update(reportsTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(reportsTable.id, paramsParsed.data.id))
    .returning();

  if (!report) {
    return { status: 404, body: { error: "Report not found" } };
  }

  return { status: 200, body: report };
}
