import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const cache = new Map();
function moduleUrl(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  let code = ts.transpile(fs.readFileSync(file, "utf8"), {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  });
  code = code.replace(
    /from ['"](\.[^'"]+)['"]/g,
    (all, rel) =>
      "from " + JSON.stringify(moduleUrl(path.resolve(path.dirname(file), rel + ".ts"))),
  );
  const url = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  cache.set(file, url);
  return url;
}
export async function loadModule(file) {
  return import(moduleUrl(file));
}
