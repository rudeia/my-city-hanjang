import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://localhost:3013/",
  out = process.env.QA_OUTPUT || "/private/tmp/my-city-hanjang-qa";
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1280, height: 1000 },
});
const page = await context.newPage(),
  errors = [],
  apiCalls = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (r.url().includes("/api/")) apiCalls.push(r.url());
});
try {
  await page.goto(base);
  await page.getByText("저장한 활동을 불러왔어요.", { exact: true }).waitFor();
  await page.getByRole("heading",{name:"도시를 계획하는 첫 장",exact:true}).waitFor();
  for(const [key,value] of Object.entries({theoryCommon:"주민의 이용 조건",theoryTension:"중심부와 외곽의 차이",theoryPriority:"차 없는 주민을 우선",goodCity:"누구나 일상 시설을 이용할 수 있는 도시",goodCityReason:"거주 적합성과 접근성의 관점을 참고했다.",goodCityCriteria:"주거와 시설의 연결, 주민의 이용 조건"}))await page.locator(`[data-field="${key}"]`).fill(value);
  await page.getByRole("checkbox",{name:"접근성",exact:true}).check();
  await page.getByRole("checkbox",{name:"공간 정의",exact:true}).check();
  await page.getByRole("checkbox",{name:"Moreno 외(2021) · 15분 도시",exact:true}).check();
  await page.getByRole("checkbox",{name:"Arnstein(1969) · 시민 참여",exact:true}).check();
  await page.getByRole("button",{name:"이 기준으로 모델 도시 살펴보기 →",exact:true}).click();
  assert.equal(await page.locator('[data-field="modelCity"]').inputValue(), "");
  assert.equal(await page.title(), "도시 한 장");
  // Examples are optional reading, never values or report content.
  await page.locator(".writing-example summary").first().click();
  assert.equal(await page.locator('[data-field="modelCity"]').inputValue(), "");
  await page.locator(".writing-example summary").first().click();
  await page.screenshot({ path: out + "/intro.png", fullPage: true });
  for (const [key, value] of Object.entries({
    modelCity: "참고 도시 A",
    modelReason: "주거와 시설의 위치를 살펴보고 싶다.",
    modelLearn: "공원과 주거지가 어떻게 이어지는지 살펴봤다.",
    modelAdapt: "내 도시의 주민 조건에 맞춰 공원의 위치를 정하겠다.",
  }))
    await page.locator(`[data-field="${key}"]`).fill(value);
  await page.locator("[data-reference-upload]").setInputFiles(out + "/intro.png");
  await page.locator("img[data-reference-image]").waitFor();
  await page.locator("#reference-title").fill("검증용 참고 도시 사진");
  await page.locator("#reference-source").fill("검증을 위해 직접 만든 화면 이미지");
  await page
    .getByRole("button", { name: "도시 선언 쓰기", exact: false })
    .click();
  for (const [key, value] of Object.entries({
    city: "채움시",
    audience: "차 없이 생활하는 주민",
    problem: "시설에 가기 어려운 불편",
    promise: "가까운 일상을 누리는 생활",
  }))
    await page.locator(`[data-field="${key}"]`).fill(value);
  await page.getByRole("button", { name: "이 약속으로 설계 시작" }).click();
  await page.getByRole("heading", {name:"도시 구상도",exact:true}).waitFor();
  assert.equal(await page.locator(".facility-cell").count(), 20);
  assert.equal(await page.locator(".road-edge").count(), 49);
  await page.getByRole("button", { name: "주거", exact: true }).click();
  await page.locator('[data-cell="0"]').click();
  await page.getByRole("combobox", { name: "시설에 표시할 전략 번호" }).selectOption("0");
  await page.getByRole("button", { name: "생활시설", exact: true }).click();
  await page.locator('[data-cell="1"]').click();
  const before = await page
    .locator(".facility-cell")
    .evaluateAll((es) => es.map((e) => ({ type: e.dataset.type, text: e.textContent })));
  await page.getByRole("button", { name: "도로망", exact: true }).click();
  await page.locator('[data-road="h:1:0"]').click();
  await page.locator('[data-road="v:0:1"]').focus();
  await page.locator('[data-road="v:0:1"]').press("Space");
  assert.deepEqual(
    await page
      .locator(".facility-cell")
      .evaluateAll((es) => es.map((e) => ({ type: e.dataset.type, text: e.textContent }))),
    before,
  );
  for (let i = 0; i < 3; i++) {
    if (await page.locator(".strategy-summary").count() <= i) await page.getByRole("button", { name: "＋ 전략 메모 붙이기", exact: true }).click();
    await page.locator(".strategy-summary").nth(i).click();
    for (const [key, value] of Object.entries({
      action: ["생활시설을 나누어 둔다", "공원을 주거지에 둔다", "교류광장을 마련한다"][i],
      place: "주거와 생활시설을 연결하는 곳에 둔다.",
      reason: "필요한 시설을 주민 가까이에 두고 싶기 때문이다.",
    }))
      await page.locator(`[data-field="plans.${i}.${key}"]`).fill(value);
    await page.getByRole("button",{name:"이 전략의 개념·연구 근거 검토",exact:true}).click();
    await page.locator("#planning-concept").selectOption(["access", "justice", "branding"][i]);
    await page.getByRole("button",{name:"검토한 근거로 전략·배치 작성 →",exact:true}).click();
  }
  await page.locator(".strategy-summary").first().click();
  await page.getByRole("button",{name:"이 전략의 개념·연구 근거 검토",exact:true}).click();
  await page.locator("#planning-source").selectOption("M");
  await page
    .locator('[data-field="plans.0.learning"]')
    .fill("근접성을 시설 위치를 정할 때 참고했다.");
  await page
    .locator('[data-field="plans.0.limit"]')
    .fill("보행시간은 이 구상도만으로 확인할 수 없다.");
  await page.getByRole("button", { name: "가치·검토", exact: true }).click();
  for (const [key, value] of Object.entries({
    values: "이용하기 쉬운지를 먼저 생각한다.",
    tradeoff: "관리 비용을 보며 차례로 조성한다.",
    check: "시설의 분포와 도로 연결을 보겠다.",
  }))
    await page.locator(`[data-field="${key}"]`).fill(value);
  await page.getByRole("button", { name: "브랜드", exact: true }).click();
  for (const [key, value] of Object.entries({
    slogan: "일상이 가까운 도시",
    keywords: "가까이,함께,일상",
    mark: "채움",
    meaning: "생활과 주민의 연결을 표현한다.",
  }))
    await page.locator(`[data-field="${key}"]`).fill(value);
  const meaning = page.locator('[data-field="meaning"]');
  await meaning.focus();
  await meaning.pressSequentially(" 뜻을 덧붙인다.");
  assert.ok(await meaning.evaluate((el) => el === document.activeElement));
  const saved = async () => {
    await page.getByRole("button", { name: "지금 저장", exact: true }).click();
    await page
      .locator(".city-save-message")
      .filter({ hasText: "이 브라우저에 저장했어요." })
      .waitFor();
    return page.evaluate(() => JSON.parse(localStorage.getItem("my-city-hanjang:activity:v1")));
  };
  let data = await saved();
  assert.equal(data.planning.city, "채움시");
  assert.deepEqual(data.planning.roads, ["h:1:0", "v:0:1"]);
  await page.reload();
  await page.getByText("저장한 활동을 불러왔어요.", { exact: true }).waitFor();
  assert.equal(await page.locator('[data-field="slogan"]').inputValue(), "일상이 가까운 도시");
  assert.equal(await page.locator(".road-edge.present").count(), 2);
  await page.getByRole("button", { name: "계획 보고서", exact: true }).click();
  const report = await page.locator(".plan-document").innerText();
  assert.ok(report.includes("근접성을 시설 위치를 정할 때 참고했다."));
  assert.ok(!report.includes("여울시"));
  assert.equal(
    await page.locator('.plan-document [data-road="h:1:0"][data-present="true"]').count(),
    1,
  );
  // Full report images contain the same research, photo and geometry as the readable report.
  for (const kind of ["png", "svg"]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: kind === "png" ? "PNG 이미지 저장" : "SVG 원본 저장", exact: true }).click();
    const download = await pending;
    assert.ok(download.suggestedFilename().includes("계획보고서"));
    await download.saveAs(out + "/report." + kind);
    assert.equal(await download.failure(), null);
  }
  const reportSvg = await fs.readFile(out + "/report.svg", "utf8");
  assert.ok(reportSvg.includes("근접성을 시설 위치를 정할 때 참고했다."));
  assert.ok(reportSvg.includes('<image href="data:image/jpeg;base64,'));
  assert.ok(reportSvg.includes('data-road="h:1:0" data-present="true"'));
  await page.getByRole("button", { name: "브랜드 보드", exact: true }).click();
  await page.locator(".plan-board-image svg").waitFor();
  for (const kind of ["png", "svg", "json"]) {
    const pending = page.waitForEvent("download");
    const label = { png: "PNG 이미지 저장", svg: "SVG 원본 저장", json: "활동 파일 저장" }[kind];
    await page.getByRole("button", { name: label, exact: true }).click();
    const download = await pending;
    await download.saveAs(out + "/activity." + kind);
    assert.equal(await download.failure(), null);
  }
  const png = await fs.readFile(out + "/activity.png");
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1600);
  assert.ok(png.readUInt32BE(20) >= 1500);
  const svg = await fs.readFile(out + "/activity.svg", "utf8");
  assert.ok(svg.includes("일상이 가까운 도시"));
  assert.ok(svg.includes('<image href="data:image/jpeg;base64,'));
  assert.ok(svg.includes("참고 도시 A"));
  assert.ok(svg.includes('data-road="h:1:0" data-present="true"'));
  // Portable file restores every field and the road network in a separate browser context.
  const second = await browser.newContext({ acceptDownloads: true });
  const other = await second.newPage();
  await other.goto(base);
  await other.getByText("저장한 활동을 불러왔어요.", { exact: true }).waitFor();
  assert.equal(await other.locator('[data-field="modelCity"]').inputValue(), "");
  await other
    .locator('input[type=file][accept=".json,application/json"]')
    .setInputFiles(out + "/activity.json");
  await other.getByRole("button", { name: "파일 내용 불러오기", exact: true }).click();
  await other.getByText("활동 파일을 불러왔어요.", { exact: false }).waitFor();
  const imported = await other.evaluate(() =>
    JSON.parse(localStorage.getItem("my-city-hanjang:activity:v1")),
  );
  assert.equal(imported.planning.city, "채움시");
  assert.deepEqual(imported.planning.roads, ["h:1:0", "v:0:1"]);
  assert.ok(imported.planning.referenceImage.startsWith("data:image/jpeg;base64,"));
  assert.equal(imported.planning.modelCity, "참고 도시 A");
  await other.reload();
  await other.getByText("저장한 활동을 불러왔어요.", { exact: true }).waitFor();
  assert.ok(
    (await other.locator(".plan-board-image svg").textContent()).includes("일상이 가까운 도시"),
  );
  await other.locator('input[type=file][accept=".json,application/json"]').setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await other.locator(".city-save-message.save-error").waitFor();
  assert.equal(
    (await other.evaluate(() => JSON.parse(localStorage.getItem("my-city-hanjang:activity:v1"))))
      .planning.city,
    "채움시",
  );
  await second.close();
  // Saving failure must leave the current writing available for a backup file.
  await page.getByRole("button", { name: "도시 설계판", exact: true }).click();
  await page.evaluate(() => {
    window.__originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function () {
      throw Error("quota test");
    };
  });
  await page.locator('[data-field="slogan"]').fill("저장 실패 뒤에도 남는 글");
  await page.getByRole("button", { name: "지금 저장", exact: true }).click();
  await page.locator(".city-save-message.save-error").waitFor();
  assert.equal(
    await page.locator('[data-field="slogan"]').inputValue(),
    "저장 실패 뒤에도 남는 글",
  );
  const backupPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "활동 파일 저장", exact: true }).click();
  const backup = await backupPending;
  await backup.saveAs(out + "/recovery.json");
  assert.equal(
    JSON.parse(await fs.readFile(out + "/recovery.json", "utf8")).planning.slogan,
    "저장 실패 뒤에도 남는 글",
  );
  await page.evaluate(() => (Storage.prototype.setItem = window.__originalSetItem));
  data = await saved();
  assert.equal(data.planning.slogan, "저장 실패 뒤에도 남는 글");
  await page.getByRole("button", { name: "지우기", exact: true }).click();
  await page.locator('[data-road="h:1:0"]').click();
  data = await saved();
  assert.deepEqual(data.planning.roads, ["v:0:1"]);
  assert.equal(data.planning.cells[1].type, "service");
  let count = 0;
  for (const width of [1280, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const label of ["도시 설계판", "계획 보고서", "브랜드 보드"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await page.waitForTimeout(80);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${width}: ${label}`,
      );
      count++;
    }
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.getByRole("button", { name: "도시 설계판", exact: true }).click();
  await page.screenshot({ path: out + "/design.png", fullPage: true });
  assert.deepEqual(apiCalls, []);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      errors,
      apiCalls,
      responsiveChecks: count,
      localReload: true,
      roadsOutsideCells: true,
      png: [png.readUInt32BE(16), png.readUInt32BE(20)],
      portableActivityFile: true,
      invalidImportPreservesData: true,
      storageFailureBackup: true,
      examplesNeverBecomeAnswers: true,
      modelCityFirst: true,
      referencePhotoAndSourceSaved: true,
    }),
  );
} finally {
  await browser.close();
}
