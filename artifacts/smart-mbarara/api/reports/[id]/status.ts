import { updateReportStatus } from "../../_reports";
import {
  allowMethods,
  type ApiRequest,
  type ApiResponse,
  getQueryValue,
  parseBody,
  sendError,
} from "../../_http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowMethods(req, res, ["PATCH", "OPTIONS"])) return;

  const id = Number(getQueryValue(req.query.id));

  try {
    const result = await updateReportStatus(id, parseBody(req.body));
    res.status(result.status).json(result.body);
  } catch (error) {
    sendError(res, error);
  }
}
