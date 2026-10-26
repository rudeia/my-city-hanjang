import assert from "node:assert/strict";
import { loadModule } from "./load-module.mjs";
const s = await loadModule("src/storage.ts"),
  m = await loadModule("src/model.ts");
const entries = new Map();
globalThis.localStorage = {
  getItem: (key) => entries.get(key) ?? null,
  setItem: (key, value) => entries.set(key, String(value)),
};
const blank = s.readDocument();
assert.equal(blank.planning.city, "");
assert.equal(blank.planning.roads.length, 0);
assert.equal(entries.size, 0);
const doc = { version: 1, planning: { ...m.newCityPlan(), city: "여울시" } };
doc.planning.cells[0] = { type: "home", strategy: 0 };
doc.planning.roads = ["h:1:0", "v:0:1"];
await s.writeDocument(doc);
assert.deepEqual(s.readDocument(), doc);
assert.deepEqual(s.parseActivityFile(s.activityFile(doc)), doc);
const before = entries.get(s.STORAGE_KEY);
assert.throws(() => s.parseActivityFile("{broken"));
assert.throws(() =>
  s.parseActivityFile(
    JSON.stringify({
      ...doc,
      planning: { ...doc.planning, cells: [{ type: "road", strategy: null }] },
    }),
  ),
);
assert.equal(entries.get(s.STORAGE_KEY), before);
globalThis.localStorage.setItem = () => {
  throw Error("quota");
};
await assert.rejects(() =>
  s.writeDocument({ ...doc, planning: { ...doc.planning, city: "새 도시" } }),
);
assert.equal(entries.get(s.STORAGE_KEY), before);
entries.set(s.STORAGE_KEY, "corrupted");
assert.throws(() => s.readDocument());
assert.equal(entries.get(s.STORAGE_KEY), "corrupted");
const a = { ...doc, planning: { ...doc.planning, city: " A " } };
assert.equal(s.parseActivityFile(s.activityFile(a)).planning.city, " A ");
console.log(
  "PASS: blank storage, full draft round-trip, portable activity file, invalid import leaves data, storage failure preserves prior record, corrupted data never silently reset",
);
