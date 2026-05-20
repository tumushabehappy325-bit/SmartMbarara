import { createReport, listReports } from "./_reports";
import {
  allowMethods,
  type ApiRequest,
  type ApiResponse,
  parseBody,
  sendError,
} from "./_http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowMethods(req, res, ["GET", "POST", "OPTIONS"])) return;

  try {
    const result =
      req.method === "GET"
        ? await listReports(req.query)
        : await createReport(parseBody(req.body));

    res.status(result.status).json(result.body);
  } catch (error) {
    sendError(res, error);
  }
}
