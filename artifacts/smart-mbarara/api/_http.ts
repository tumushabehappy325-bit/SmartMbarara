export type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
};

export function allowMethods(
  req: ApiRequest,
  res: ApiResponse,
  methods: string[],
) {
  res.setHeader("Allow", methods);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  if (!methods.includes(req.method ?? "")) {
    res.status(405).json({ error: "Method not allowed" });
    return true;
  }

  return false;
}

export function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseBody(body: unknown) {
  if (typeof body !== "string") return body;
  if (!body.trim()) return {};
  return JSON.parse(body);
}

export function sendError(res: ApiResponse, error: unknown) {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
