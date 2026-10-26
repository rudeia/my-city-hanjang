export type BoardDocument = { svg: string; width: number; height: number; name: string };
export function xml(s: string) {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
export function lines(value: string, width: number, size: number) {
  const limit = width / size,
    result: string[] = [];
  let line = "",
    used = 0;
  const unit = (c: string) =>
    /[\u0020-\u007E]/.test(c) ? (/[il.,' ]/.test(c) ? 0.4 : 0.78) : 1.06;
  for (const word of value.trim().split(/\s+/).filter(Boolean)) {
    const units = Array.from(word).reduce((n, c) => n + unit(c), 0);
    if (line && used + 0.4 + units > limit) {
      result.push(line);
      line = "";
      used = 0;
    }
    if (line) {
      line += " ";
      used += 0.4;
    }
    for (const c of Array.from(word)) {
      const u = unit(c);
      if (line && used + u > limit) {
        result.push(line);
        line = "";
        used = 0;
      }
      line += c;
      used += u;
    }
  }
  if (line) result.push(line);
  return result.length ? result : [""];
}
