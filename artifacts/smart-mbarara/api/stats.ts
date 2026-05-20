import { getStatsSummary } from "./_stats";
import {
  allowMethods,
  type ApiRequest,
  type ApiResponse,
  sendError,
} from "./_http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowMethods(req, res, ["GET", "OPTIONS"])) return;

  try {
    res.status(200).json(await getStatsSummary());
  } catch (error) {
    sendError(res, error);
  }
}
