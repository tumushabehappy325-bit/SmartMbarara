type ResWithHeaders = {
  setHeader: (name: string, value: string | string[]) => void;
};

export function setCorsHeaders(res: ResWithHeaders) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
