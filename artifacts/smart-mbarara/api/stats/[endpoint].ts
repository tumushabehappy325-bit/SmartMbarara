import {
  getRecentActivity,
  getStatsByCategory,
  getStatsByStatus,
  getStatsSummary,
} from "../_stats";
import {
  allowMethods,
  type ApiRequest,
  type ApiResponse,
  getQueryValue,
  sendError,
} from "../_http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowMethods(req, res, ["GET", "OPTIONS"])) return;

  try {
    const endpoint = getQueryValue(req.query.endpoint);

    if (endpoint === "summary") {
      res.status(200).json(await getStatsSummary());
      return;
    }
    if (endpoint === "by-category") {
      res.status(200).json(await getStatsByCategory());
      return;
    }
    if (endpoint === "by-status") {
      res.status(200).json(await getStatsByStatus());
      return;
    }
    if (endpoint === "recent") {
      res.status(200).json(await getRecentActivity());
      return;
    }

    res.status(404).json({ error: "Stats endpoint not found" });
  } catch (error) {
    sendError(res, error);
  }
}
