import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, like, and, desc, sql } from "drizzle-orm";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
  UpdateReportParams,
  UpdateReportBody,
  UpdateReportStatusParams,
  UpdateReportStatusBody,
} from "@workspace/api-zod";

const router = Router();

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

router.get("/reports", async (req, res) => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, status, search } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(reportsTable.category, category));
  if (status) conditions.push(eq(reportsTable.status, status));
  if (search)
    conditions.push(like(reportsTable.description, `%${search}%`));

  const rows = await db
    .select()
    .from(reportsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.createdAt));

  res.json(rows);
});

router.post("/reports", async (req, res) => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
    return;
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

  res.status(201).json(report);
});

router.get("/reports/:id", async (req, res) => {
  const parsed = GetReportParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, parsed.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

router.patch("/reports/:id", async (req, res) => {
  const paramsParsed = UpdateReportParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateReportBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
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
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

router.patch("/reports/:id/status", async (req, res) => {
  const paramsParsed = UpdateReportStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateReportStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const [report] = await db
    .update(reportsTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(reportsTable.id, paramsParsed.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

export default router;
