import { cleanCityPlan, newCityPlan, type CityPlan } from "./model";
export type PlanDocument = { version: 1; planning: CityPlan };
export const STORAGE_KEY = "my-city-hanjang:activity:v1";
const MAX_FILE_BYTES = 2000000;
export function blankDocument(): PlanDocument {
  return { version: 1, planning: newCityPlan() };
}
export function parseActivityFile(text: string): PlanDocument {
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES)
    throw Error("활동 파일이 너무 커요. 도시 한 장에서 저장한 파일인지 확인해 주세요.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw Error("활동 파일을 읽지 못했어요. JSON 파일을 확인해 주세요.");
  }
  if (!parsed || typeof parsed !== "object" || (parsed as { version?: number }).version !== 1)
    throw Error("도시 한 장의 활동 파일인지 확인해 주세요.");
  return { version: 1, planning: cleanCityPlan((parsed as { planning?: unknown }).planning) };
}
export function readDocument(): PlanDocument {
  const text = localStorage.getItem(STORAGE_KEY);
  return text === null ? blankDocument() : parseActivityFile(text);
}
export async function writeDocument(document: PlanDocument) {
  const checked = parseActivityFile(JSON.stringify(document));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  } catch {
    throw Error("이 브라우저에 저장하지 못했어요. 활동 파일을 내려받아 내용을 보관해 주세요.");
  }
}
export function activityFile(document: PlanDocument) {
  const checked = parseActivityFile(JSON.stringify(document));
  return JSON.stringify(checked, null, 2);
}
