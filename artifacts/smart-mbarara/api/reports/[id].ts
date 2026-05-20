import { getReport, updateReport } from "../_reports.js";
import {
  allowMethods,
  type ApiRequest,
  type ApiResponse,
  getQueryValue,
  parseBody,
  sendError,
} from "../_http.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowMethods(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  const id = Number(getQueryValue(req.query.id));

  try {
    const result =
      req.method === "GET"
        ? await getReport(id)
        : await updateReport(id, parseBody(req.body));

    res.status(result.status).json(result.body);
  } catch (error) {
    sendError(res, error);
  }
}
