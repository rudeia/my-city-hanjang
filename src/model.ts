export const COLS = 5,
  ROWS = 4;
export const facilityNames = {
  home: "주거",
  service: "생활시설",
  park: "공원",
  work: "일자리",
  landmark: "대표 공간",
} as const;
export type Facility = "" | keyof typeof facilityNames;
export type PlanCell = { type: Facility; strategy: number | null };
export const planFields = {
  modelCity: { label: "참고할 모델 도시", max: 160 },
  modelReason: { label: "이 도시를 고른 이유", max: 700 },
  modelLearn: { label: "사진·지도·자료에서 찾은 특징과 배울 점", max: 700 },
  modelAdapt: { label: "내 도시에서는 다르게 만들 점과 그 이유", max: 700 },
  city: { label: "도시 이름", max: 60 },
  audience: { label: "먼저 생각할 주민", max: 200 },
  problem: { label: "줄이거나 예방하고 싶은 불편", max: 300 },
  promise: { label: "이 도시에서 누리고 싶은 생활", max: 300 },
  values: { label: "가장 중요하게 생각한 가치와 이유", max: 700 },
  tradeoff: { label: "계획의 부담·다른 방법과 비교한 이유", max: 700 },
  check: { label: "도시짓기에서 확인할 것", max: 700 },
  slogan: { label: "슬로건", max: 160 },
  keywords: { label: "핵심어 세 개 (쉼표나 가운데점으로 구분)", max: 80 },
  mark: { label: "글자 상징", max: 4 },
  meaning: { label: "이름·상징·색에 담은 의미", max: 700 },
  feedback: { label: "받은 질문과 내가 답한 내용", max: 700 },
  revision: { label: "고친 점 또는 유지한 이유", max: 700 },
  referenceTitle: { label: "참고한 도시·장소", max: 160 },
  referenceSource: { label: "사진 출처 (사이트·기관·주소 등)", max: 600 },
} as const;
export type PlanField = keyof typeof planFields;
export const strategyFields = {
  action: { label: "무엇을 할지 한 문장으로", max: 160 },
  place: { label: "어디에 놓고 어떻게 연결할지", max: 700 },
  reason: { label: "이 배치를 선택한 이유", max: 700 },
  learning: { label: "자료에서 배운 점과 내 계획에 적용할 점", max: 700 },
  limit: { label: "그대로 적용하기 어려운 점이나 더 확인할 것", max: 700 },
} as const;
export type StrategyField = keyof typeof strategyFields;
export const planningConcepts = {
  livability: {
    name: "거주 적합성",
    text: "도시의 환경·시설과 주민이 느끼는 생활의 질을 함께 살펴요. 사람마다 중요한 조건이 다를 수 있어요.",
  },
  access: {
    name: "접근성",
    text: "필요한 장소와 서비스를 실제로 이용하기 쉬운 정도예요. 거리뿐 아니라 경로·시간·비용도 함께 살펴요.",
  },
  justice: {
    name: "공간 정의",
    text: "공간과 서비스의 혜택·부담, 결정에 참여할 기회가 누구에게 돌아가는지 살펴요.",
  },
  sustainability: {
    name: "지속가능성",
    text: "현재의 생활과 미래 세대의 환경·자원 이용 기회를 함께 고려해요. 환경·생활·운영 비용을 함께 살펴요.",
  },
  resilience: {
    name: "회복력",
    text: "위기에도 중요한 생활 기능을 유지·회복하고 변화에 적응하는 관점이에요. 누구의 어떤 기능을 지킬지도 물어요.",
  },
  branding: {
    name: "도시 정체성과 브랜딩",
    text: "도시가 지향하는 가치와 특징을 이름·상징, 공간·정책·주민의 경험으로 연결해요.",
  },
  participation: {
    name: "시민 참여",
    text: "생활이 달라질 당사자의 의견을 어떻게 듣고 계획과 결정에 반영할지 생각해요.",
  },
  inclusion: {
    name: "다양성과 포용",
    text: "서로 다른 생활 조건의 주민이 공간·서비스·기회에서 배제되지 않는지 살펴요.",
  },
} as const;
export const planningSources = {
  M: {
    name: "Moreno 외(2021) · 15분 도시",
    type: "개념 제안 논문",
    text: "일상 기능에 가까이 접근하는 도시를 구상하는 관점을 다뤄요. 특정 배치가 모든 도시에서 같은 효과를 낸다는 뜻으로 읽지 않아요.",
    doi: "10.3390/smartcities4010006",
  },
  K: {
    name: "Kavaratzis(2004) · 도시 브랜딩",
    type: "이론적 틀 제안",
    text: "도시 이미지와 브랜드를 주민이 도시와 관계 맺고 경험하는 과정과 함께 살펴요. 이름·상징을 공간 계획과 연결하는 데 참고할 수 있어요.",
    doi: "10.1057/palgrave.pb.5990005",
  },
  R: {
    name: "Meerow 외(2016) · 도시 회복력",
    type: "문헌 검토 연구",
    text: "누구를 위한 어떤 기능의 회복인지 묻는 관점을 제시해요. 시설 하나로 재난 대응 효과를 입증한 자료는 아니에요.",
    doi: "10.1016/j.landurbplan.2015.11.011",
  },
  A: {
    name: "Arnstein(1969) · 시민 참여",
    type: "참여 유형론",
    text: "계획과 결정에 시민이 갖는 영향력을 살펴요. 의견을 듣는 것과 실제 결정에 반영하는 것을 구분하는 데 참고해요.",
    doi: "10.1080/01944366908977225",
  },
} as const;
export type Strategy = Record<StrategyField, string> & {
  concept: "" | keyof typeof planningConcepts;
  source: "" | keyof typeof planningSources;
};
export type PlanView = "reference" | "intro" | "design" | "report" | "board";
export type PlanSection = "plans" | "values" | "brand" | "reflection";
export type CityPlan = Record<PlanField, string> & {
  version: 1;
  started: boolean;
  view: PlanView;
  section: PlanSection;
  selectedPlan: number;
  plans: Strategy[];
  cells: PlanCell[];
  roads: string[];
  referenceImage: string;
};
export function newCityPlan(): CityPlan {
  return {
    ...(Object.fromEntries(Object.keys(planFields).map((k) => [k, ""])) as Record<
      PlanField,
      string
    >),
    version: 1,
    started: false,
    view: "reference",
    section: "plans",
    selectedPlan: 0,
    plans: Array.from({ length: 3 }, () => ({
      action: "",
      place: "",
      reason: "",
      learning: "",
      limit: "",
      concept: "",
      source: "",
    })),
    cells: Array.from({ length: COLS * ROWS }, () => ({ type: "", strategy: null })),
    roads: [],
    referenceImage: "",
  } as CityPlan;
}
export type RoadEdge = {
  id: string;
  orientation: "h" | "v";
  row: number;
  col: number;
  from: [number, number];
  to: [number, number];
};
export const roadEdges: RoadEdge[] = [
  ...Array.from({ length: (ROWS + 1) * COLS }, (_, i) => {
    const row = Math.floor(i / COLS),
      col = i % COLS;
    return {
      id: `h:${row}:${col}`,
      orientation: "h" as const,
      row,
      col,
      from: [row, col] as [number, number],
      to: [row, col + 1] as [number, number],
    };
  }),
  ...Array.from({ length: ROWS * (COLS + 1) }, (_, i) => {
    const row = Math.floor(i / (COLS + 1)),
      col = i % (COLS + 1);
    return {
      id: `v:${row}:${col}`,
      orientation: "v" as const,
      row,
      col,
      from: [row, col] as [number, number],
      to: [row + 1, col] as [number, number],
    };
  }),
];
const roadIds = new Set(roadEdges.map((e) => e.id));
export function junctionUsed(roads: ReadonlySet<string>, row: number, col: number) {
  return (
    roads.has(`h:${row}:${col - 1}`) ||
    roads.has(`h:${row}:${col}`) ||
    roads.has(`v:${row - 1}:${col}`) ||
    roads.has(`v:${row}:${col}`)
  );
}
export function setRoad(plan: CityPlan, id: string, present: boolean): CityPlan {
  if (!roadIds.has(id)) throw Error("잘못된 도로 구간입니다.");
  const roads = new Set(plan.roads);
  if (present) roads.add(id);
  else roads.delete(id);
  return { ...plan, roads: [...roads].sort() };
}
export function cleanCityPlan(value: unknown): CityPlan {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("도시 계획을 확인해 주세요.");
  const v = value as Record<string, unknown>,
    out = newCityPlan();
  if (
    v.version !== 1 ||
    typeof v.started !== "boolean" ||
    !["reference", "intro", "design", "report", "board"].includes(String(v.view)) ||
    !["plans", "values", "brand", "reflection"].includes(String(v.section)) ||
    !Number.isInteger(v.selectedPlan) ||
    Number(v.selectedPlan) < 0 ||
    Number(v.selectedPlan) > 2
  )
    throw Error("도시 계획 형식을 확인해 주세요.");
  for (const key of Object.keys(planFields) as PlanField[]) {
    const text = v[key] ?? "";
    if (typeof text !== "string" || text.length > planFields[key].max)
      throw Error(`${planFields[key].label}의 길이를 확인해 주세요.`);
    out[key] = text;
  }
  if (!Array.isArray(v.plans) || v.plans.length !== 3) throw Error("전략 세 개를 확인해 주세요.");
  out.plans = v.plans.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("전략을 확인해 주세요.");
    const p = raw as Record<string, unknown>,
      result = { ...out.plans[0] };
    for (const key of Object.keys(strategyFields) as StrategyField[]) {
      const text = p[key] ?? "";
      if (typeof text !== "string" || text.length > strategyFields[key].max)
        throw Error("전략의 글 길이를 확인해 주세요.");
      result[key] = text;
    }
    if (
      typeof p.concept !== "string" ||
      (p.concept !== "" && !Object.hasOwn(planningConcepts, p.concept)) ||
      typeof p.source !== "string" ||
      (p.source !== "" && !Object.hasOwn(planningSources, p.source))
    )
      throw Error("선택한 개념과 자료를 확인해 주세요.");
    result.concept = p.concept as Strategy["concept"];
    result.source = p.source as Strategy["source"];
    return result;
  });
  if (!Array.isArray(v.cells) || v.cells.length !== COLS * ROWS)
    throw Error("구상도를 확인해 주세요.");
  out.cells = v.cells.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("시설을 확인해 주세요.");
    const cell = raw as Record<string, unknown>;
    if (
      typeof cell.type !== "string" ||
      (cell.type !== "" && !Object.hasOwn(facilityNames, cell.type)) ||
      (cell.strategy !== null &&
        (!Number.isInteger(cell.strategy) ||
          Number(cell.strategy) < 0 ||
          Number(cell.strategy) > 2))
    )
      throw Error("시설의 종류와 전략 번호를 확인해 주세요.");
    if (!cell.type && cell.strategy !== null)
      throw Error("빈 시설 칸의 전략 번호를 확인해 주세요.");
    return { type: cell.type as Facility, strategy: cell.strategy as number | null };
  });
  if (
    !Array.isArray(v.roads) ||
    v.roads.length > roadEdges.length ||
    v.roads.some((id) => typeof id !== "string" || !roadIds.has(id)) ||
    new Set(v.roads).size !== v.roads.length
  )
    throw Error("도로 구간을 확인해 주세요.");
  out.roads = [...v.roads].sort();
  const image = v.referenceImage ?? "";
  if (
    typeof image !== "string" ||
    image.length > 1400000 ||
    (image !== "" && !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+={0,2}$/.test(image))
  )
    throw Error("참고사진을 확인해 주세요. JPG·PNG·WebP 파일을 앱에서 다시 선택할 수 있어요.");
  out.referenceImage = image;
  out.started = v.started;
  out.view = v.view as PlanView;
  out.section = v.section as PlanSection;
  out.selectedPlan = Number(v.selectedPlan);
  return out;
}
export const hasText = (s: string) => !!s.trim();
export function planChecks(p: CityPlan) {
  return [
    {
      name: "모델 도시 살펴보기",
      done: [p.modelCity, p.modelReason, p.modelLearn, p.modelAdapt].every(hasText),
    },
    { name: "도시 선언", done: [p.city, p.audience, p.problem, p.promise].every(hasText) },
    {
      name: "전략 3개와 교과 개념",
      done: p.plans.every((s) => [s.action, s.place, s.reason, s.concept].every(hasText)),
    },
    {
      name: "연구 근거와 한계",
      done: p.plans.some((s) => [s.source, s.learning, s.limit].every(hasText)),
    },
    { name: "공간 구상도", done: p.cells.some((c) => !!c.type) },
    { name: "가치·부담·확인 계획", done: [p.values, p.tradeoff, p.check].every(hasText) },
    {
      name: "브랜드 표현",
      done:
        [p.slogan, p.mark, p.meaning].every(hasText) &&
        p.keywords.split(/[·,]/).filter((k) => k.trim()).length === 3,
    },
  ];
}
export function particle(value: string, yes: string, no: string) {
  const text = value.trim(),
    n = text.charCodeAt(text.length - 1) - 44032;
  return n >= 0 && n <= 11171 && n % 28 !== 0 ? yes : no;
}
export function cityDeclaration(p: CityPlan) {
  if (![p.city, p.audience, p.problem, p.promise].every(hasText)) return "";
  return `${p.city}${particle(p.city, "은", "는")} ${p.audience}${particle(p.audience, "을", "를")} 위해 ${p.problem}${particle(p.problem, "을", "를")} 줄이고, ${p.promise}${particle(p.promise, "을", "를")} 목표로 합니다.`;
}
export function selectedSources(p: CityPlan) {
  return [
    ...new Set(p.plans.map((s) => s.source).filter((s): s is keyof typeof planningSources => !!s)),
  ];
}
export function planReportSections(p: CityPlan) {
  return [
    {
      title: "참고한 모델 도시",
      paragraphs: [p.modelCity, p.modelReason, p.modelLearn, p.modelAdapt, p.referenceSource],
    },
    { title: "도시의 출발점과 비전", paragraphs: [cityDeclaration(p), p.values] },
    {
      title: "공간 전략과 선택의 이유",
      paragraphs: p.plans.flatMap((s, i) => [
        `${i + 1}. ${s.action || "전략 작성 전"}`,
        s.place,
        s.reason,
        s.concept ? "적용한 교과 개념: " + planningConcepts[s.concept].name : "",
        s.source ? "선택한 연구 자료: " + planningSources[s.source].name : "",
        s.learning,
        s.limit,
      ]),
    },
    { title: "계획의 부담과 이후 확인", paragraphs: [p.tradeoff, p.check] },
    { title: "도시 브랜드의 표현", paragraphs: [p.slogan, p.keywords, p.mark, p.meaning] },
    { title: "의견을 반영한 수정", paragraphs: [p.feedback, p.revision] },
  ];
}
