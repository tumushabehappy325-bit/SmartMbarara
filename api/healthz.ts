import { setCorsHeaders } from "./_cors";

type Req = { method?: string };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
};

export default function handler(req: Req, res: Res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({ status: "ok" });
}
