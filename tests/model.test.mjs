import assert from "node:assert/strict";
import { loadModule } from "./load-module.mjs";
const m = await loadModule("src/model.ts"),
  b = await loadModule("src/board.ts");
let p = m.newCityPlan();
assert.equal(p.city, "");
assert.equal(p.cells.length, 20);
assert.equal(p.roads.length, 0);
assert.equal(p.plans.length, 3);
assert.equal(m.planChecks(p).filter((x) => x.done).length, 0);
assert.deepEqual(m.cleanCityPlan(p), p);
assert.equal(m.roadEdges.length, 49);
assert.equal(new Set(m.roadEdges.map((e) => e.id)).size, 49);
p.cells[7] = { type: "home", strategy: 0 };
const cells = structuredClone(p.cells);
for (const edge of m.roadEdges) p = m.setRoad(p, edge.id, true);
assert.deepEqual(p.cells, cells);
assert.equal(p.roads.length, 49);
assert.ok(m.junctionUsed(new Set(p.roads), 0, 0));
assert.ok(m.junctionUsed(new Set(p.roads), 4, 5));
assert.deepEqual(m.cleanCityPlan(JSON.parse(JSON.stringify(p))), p);
for (const edge of m.roadEdges) p = m.setRoad(p, edge.id, false);
assert.equal(p.roads.length, 0);
assert.deepEqual(p.cells, cells);
assert.equal(m.junctionUsed(new Set(p.roads), 0, 0), false);
for (const id of ["h:5:0", "h:0:5", "v:4:0", "v:0:6", "road:0", "__proto__"])
  assert.throws(() => m.setRoad(p, id, true));
assert.throws(() =>
  m.cleanCityPlan({
    ...p,
    cells: p.cells.map((c, i) => (i === 0 ? { type: "road", strategy: null } : c)),
  }),
);
assert.throws(() => m.cleanCityPlan({ ...p, roads: ["h:0:0", "h:0:0"] }));
assert.throws(() =>
  m.cleanCityPlan({
    ...p,
    plans: p.plans.map((s, i) => (i === 0 ? { ...s, concept: "toString" } : s)),
  }),
);
assert.throws(() => m.cleanCityPlan({ ...p, city: "가".repeat(61) }));
p = {
  ...p,
  city: "연결시",
  modelCity: "참고 도시",
  modelReason: "배치를 살핀다.",
  modelLearn: "시설 관계를 배운다.",
  modelAdapt: "주민 조건에 맞게 바꾼다.",
  audience: "주민",
  problem: "멀리 돌아가는 불편",
  promise: "가까운 일상",
  values: "형평성",
  tradeoff: "운영 비용을 고려한다.",
  check: "지도와 운영 자료로 확인한다.",
  slogan: "함께 누리는 일상",
  mark: "연결",
  keywords: "함께,일상,연결",
  meaning: "주민의 연결을 표현한다.",
  plans: p.plans.map((s, i) => ({
    ...s,
    action: `전략 ${i + 1}`,
    place: "주거와 생활시설을 연결한다.",
    reason: "주민의 생활을 고려한다.",
    concept: "access",
    source: i === 0 ? "M" : "",
    learning: i === 0 ? "근접성을 위치 계획에 적용한다." : "",
    limit: i === 0 ? "보행시간을 직접 판정하지 않는다." : "",
  })),
};
p = m.setRoad(p, "h:1:2", true);
p = m.setRoad(p, "v:1:2", true);
assert.ok(m.planChecks(p).every((x) => x.done));
assert.ok(m.cityDeclaration(p).includes("연결시는"));
const report = m.planReportSections(p);
assert.ok(report.flatMap((s) => s.paragraphs).includes(p.plans[0].reason));
const map = b.cityMapSVG(p);
assert.ok(map.includes('data-road="h:1:2" data-present="true"'));
assert.ok(map.includes('data-cell="7" data-type="home"'));
const output = b.makePlanBoard(p);
assert.ok(output.svg.includes(p.slogan));
assert.ok(output.svg.includes(p.plans[0].place));
assert.ok(output.svg.includes("10.3390/smartcities4010006"));
const hostile = b.makePlanBoard({ ...p, city: "<script>bad</script>", meaning: '&< >"' });
assert.ok(!hostile.svg.includes("<script>"));
assert.ok(hostile.svg.includes("&lt;script&gt;"));
const maximum = structuredClone(p);
for (const key of Object.keys(m.planFields)) maximum[key] = "한".repeat(m.planFields[key].max);
for (const plan of maximum.plans)
  for (const key of Object.keys(m.strategyFields))
    plan[key] = "한".repeat(m.strategyFields[key].max);
const maxDoc = b.makePlanBoard(maximum);
assert.ok(maxDoc.height < 16000);
for (const match of maxDoc.svg.matchAll(/<text[^>]* y="([\d.]+)"/g))
  assert.ok(Number(match[1]) < maxDoc.height);
console.log(
  "PASS: blank plan, 49 independent roads, facility preservation, schema validation, shared report/board, XML escaping and maximum text bounds",
);

assert.throws(() =>
  m.cleanCityPlan({ ...m.newCityPlan(), referenceImage: "data:image/svg+xml,<svg/>" }),
);
const legacyFile = m.newCityPlan();
delete legacyFile.referenceImage;
delete legacyFile.modelCity;
assert.equal(m.cleanCityPlan(legacyFile).referenceImage, "");
assert.equal(m.cleanCityPlan(legacyFile).modelCity, "");
