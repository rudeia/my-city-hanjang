import {stickerKinds,stickerColors,type BoardSticker} from "./stickers";
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
  theoryCommon: { label: "여러 관점에서 공통으로 중요하게 본 점", max: 700 },
  theoryTension: { label: "관점의 차이와 함께 살필 조건", max: 700 },
  theoryPriority: { label: "내 도시에서 우선할 관점과 그 이유", max: 700 },
  goodCity: { label: "내가 생각하는 좋은 도시", max: 500 },
  goodCityReason: { label: "이렇게 정의한 근거", max: 700 },
  goodCityCriteria: { label: "내 도시에서 확인할 기준 2~3가지", max: 700 },
  modelCity: { label: "참고할 모델 도시", max: 160 },
  modelReason: { label: "이 도시를 고른 이유", max: 700 },
  modelLearn: { label: "사진·지도·자료에서 찾은 특징과 배울 점", max: 700 },
  modelAdapt: { label: "내 도시에서는 다르게 만들 점과 그 이유", max: 700 },
  city: { label: "도시 이름", max: 60 },
  audience: { label: "먼저 생각할 주민", max: 200 },
  problem: { label: "줄이거나 예방하고 싶은 불편", max: 300 },
  promise: { label: "이 도시에서 누리고 싶은 생활", max: 300 },
  declaration: { label: "도시 선언문", max: 1000 },
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
  compact: {
    name: "압축 도시·스마트 성장",
    text: "무분별한 도시 확장을 줄이고 도시 기능을 공간적으로 집약하는 계획. / 보행 환경, 대중교통·자전거 이용과 시설 간 연결 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 지속가능성과 회복력을 높이는 도시 계획 · 170~171쪽",
  },
  universal: {
    name: "유니버설 디자인",
    text: "연령·성별·장애 유무와 관계없이 모든 사람을 고려하는 디자인. / 시설의 존재뿐 아니라 출입·이동·이용 과정의 장벽 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 유니버설 디자인 사례 · 166쪽",
  },
  place: {
    name: "장소감·도시 정체성",
    text: "생활 경험을 통해 장소에 부여하는 주관적 의미와 도시의 고유한 특성. / 주민이 자주 찾는 장소와 기억·애착을 형성할 공간 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅰ. 삶의 공간, 도시 · 도시의 주관적 의미 · 13쪽",
  },
  publicness: {
    name: "도시의 공공성",
    text: "도시 공간과 자산을 함께 이용하고 관리하는 문제를 살피는 관점. / 이용할 수 있는 주민의 범위, 관리 주체와 의사결정 방법 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 도시의 공공성과 도시 민주주의 · 177쪽부터",
  },
  livability: {
    name: "거주 적합성",
    text: "생활하기에 알맞은 도시의 조건. / 환경·시설과 주민이 느끼는 생활의 질 검토. 주민마다 중요하게 여기는 조건의 차이 고려.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅰ. 삶의 공간, 도시 · 살기 좋은 도시의 조건 · 38쪽",
  },
  access: {
    name: "접근성",
    text: "필요한 장소와 서비스를 실제로 이용하기 쉬운 정도. / 거리·이동 경로·시간·비용과 이용자의 조건 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅲ. 도시 문제와 공간 정의 · 공간 정의와 자원에 대한 접근 · 122쪽",
  },
  justice: {
    name: "공간 정의",
    text: "공간과 서비스의 혜택·부담 및 참여 기회의 공정한 배분. / 취약한 지역·계층에 부담이 집중되는지 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅲ. 도시 문제와 공간 정의 · 도시 환경 문제와 재난의 공간 불평등 · 122쪽",
  },
  sustainability: {
    name: "지속가능성",
    text: "현재와 미래 세대의 환경·자원 이용 기회를 함께 고려하는 관점. / 도시의 환경·사회·경제 조건과 운영 부담 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 도시의 지속가능성과 회복력 · 164~165쪽",
  },
  resilience: {
    name: "회복력",
    text: "위기 속에서도 중요한 생활 기능을 유지·회복하고 변화에 적응하는 역량. / 누구의 어떤 기능을 지킬 것인지 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 도시의 지속가능성과 회복력 · 165쪽",
  },
  branding: {
    name: "도시 정체성과 브랜딩",
    text: "도시가 지향하는 가치와 고유한 특징을 이름·상징·공간·정책·주민 경험으로 연결하는 과정. / 브랜드에 담은 가치가 실제 공간 계획에서 드러나는지 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅱ. 변화하는 도시 · 도시 브랜딩과 건축 · 69쪽",
  },
  participation: {
    name: "시민 참여",
    text: "생활이 달라질 당사자의 의견을 계획과 의사결정에 반영하는 과정. / 의견 수렴 대상·방법·반영 범위 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 도시의 공공성과 도시 민주주의 · 177쪽부터",
  },
  inclusion: {
    name: "다양성과 포용",
    text: "서로 다른 생활 조건의 주민이 공간·서비스·기회에서 배제되지 않도록 하는 관점. / 연령·장애·문화적 차이에 따른 이용 조건 검토.",
    textbook: "미래엔 『도시의 미래 탐구』 Ⅳ. 도시의 미래 · 유니버설 디자인 사례 · 166쪽",
  },
} as const;
export const planningSources = {
  M: {
    name: "Moreno 외(2021) · 15분 도시",
    type: "개념 제안 논문",
    text: "일상 기능에 가까이 접근할 수 있는 도시를 제안하는 개념 연구. 도시별 조건에 따른 적용 검토 필요.",
    doi: "10.3390/smartcities4010006",
  },
  K: {
    name: "Kavaratzis(2004) · 도시 브랜딩",
    type: "이론적 틀 제안",
    text: "도시 이미지와 주민의 경험을 연결하는 브랜딩의 이론적 틀. 이름·상징과 공간 계획의 일관성 검토에 활용.",
    doi: "10.1057/palgrave.pb.5990005",
  },
  R: {
    name: "Meerow 외(2016) · 도시 회복력",
    type: "문헌 검토 연구",
    text: "도시 회복력의 정의와 쟁점을 정리한 문헌 검토. 보호할 주민과 생활 기능의 명확화에 활용. 개별 시설의 재난 대응 효과를 입증한 연구는 아님.",
    doi: "10.1016/j.landurbplan.2015.11.011",
  },
  A: {
    name: "Arnstein(1969) · 시민 참여",
    type: "참여 유형론",
    text: "시민이 의사결정에 갖는 권한에 따라 참여 수준을 구분한 유형론. 의견 청취와 결정 권한의 차이 검토에 활용.",
    doi: "10.1080/01944366908977225",
  },
  E: {
    name: "Ewing·Cervero(2010) · 도시 공간과 이동",
    type: "메타분석",
    text: "도시 공간의 특성과 이동 행태의 관계를 종합한 연구. 시설의 조합·도로 연결·목적지 접근을 함께 검토하는 데 활용.",
    doi: "10.1080/01944361003766766",
  },
  W: {
    name: "Wolch 외(2014) · 녹지 조성과 환경 정의",
    type: "문헌 검토·도시 녹화 전략 비교",
    text: "녹지의 편익과 함께 주거비 상승·기존 주민의 이주 부담 가능성을 검토. 녹지 계획의 혜택과 부담을 함께 평가하는 데 활용.",
    doi: "10.1016/j.landurbplan.2014.01.017",
  },
  P: {
    name: "Rigolon(2016) · 공원 접근의 불평등",
    type: "실증 연구 문헌 검토",
    text: "공원 접근을 거리·면적·질로 나누어 불평등을 검토한 연구. 공원의 수와 위치만으로 주민의 이용 기회를 판단하지 않도록 활용.",
    doi: "10.1016/j.landurbplan.2016.05.017",
  },

} as const;
export type Strategy = Record<StrategyField, string> & {
  concept: "" | keyof typeof planningConcepts;
  source: "" | keyof typeof planningSources;
};
export type PlanView = "theory" | "criteria" | "reference" | "intro" | "design" | "report" | "board";
export type PlanSection = "research" | "plans" | "values" | "brand" | "reflection";
export const boardBlockIds = ["identity","symbol","definition","criteria","declaration","map","strategy-0","strategy-1","strategy-2","meaning","tradeoff","check","reference","reference-photo","sources"] as const;
export type BoardBlockId = typeof boardBlockIds[number] | `sticker-${string}`;
export type BoardLayout = Partial<Record<BoardBlockId,{x:number;y:number;scale?:number}>>;
export type CityPlan = Record<PlanField, string> & {
  version: 1;
  boardLayout: BoardLayout;
  boardStickers: BoardSticker[];
  started: boolean;
  view: PlanView;
  section: PlanSection;
  selectedPlan: number;
  theoryConcepts: Exclude<Strategy["concept"], "">[];
  theorySources: Exclude<Strategy["source"], "">[];
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
    boardLayout: {},
    boardStickers: [],
    started: false,
    view: "theory",
    theoryConcepts: [],
    theorySources: [],
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
    !["theory", "criteria", "reference", "intro", "design", "report", "board"].includes(String(v.view)) ||
    !["research", "plans", "values", "brand", "reflection"].includes(String(v.section)) ||
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
  function selections(key:string,legacyKey:string,choices:Record<string,unknown>) {
    const legacy=v[legacyKey]??"";
    if(v[key]===undefined && (typeof legacy!=="string" || (legacy!==""&&!Object.hasOwn(choices,legacy))))throw Error("이론적 배경의 개념과 자료를 확인해 주세요.");
    const values=v[key]===undefined?(legacy?[legacy]:[]):v[key];
    if(!Array.isArray(values)||values.length>Object.keys(choices).length||values.some(x=>typeof x!=="string"||!Object.hasOwn(choices,x))||new Set(values).size!==values.length)throw Error("비교할 개념과 연구 선택을 확인해 주세요.");
    return values as string[];
  }
  out.theoryConcepts=selections("theoryConcepts","theoryConcept",planningConcepts) as CityPlan["theoryConcepts"];
  out.theorySources=selections("theorySources","theorySource",planningSources) as CityPlan["theorySources"];
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
  const stickers=v.boardStickers??[];
  if(!Array.isArray(stickers)||stickers.length>40)throw Error("스티커는 40개까지 추가할 수 있습니다.");
  const stickerIds=new Set<string>();
  out.boardStickers=stickers.map(raw=>{
    if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("스티커 형식을 확인해 주세요.");
    const q=raw as Record<string,unknown>;
    if(typeof q.id!=="string"||!/^sticker-[a-zA-Z0-9-]{1,50}$/.test(q.id)||stickerIds.has(q.id)||typeof q.kind!=="string"||!Object.hasOwn(stickerKinds,q.kind)||typeof q.color!=="string"||!Object.hasOwn(stickerColors,q.color)||![0,90,180,270].includes(q.rotation as number))throw Error("스티커 형식을 확인해 주세요.");
    stickerIds.add(q.id);return {id:q.id,kind:q.kind,color:q.color,rotation:q.rotation} as BoardSticker;
  });
  const layout=v.boardLayout===undefined?{}:v.boardLayout;
  if(!layout||typeof layout!=="object"||Array.isArray(layout)||Object.keys(layout).length>boardBlockIds.length+40)throw Error("보드 배치를 확인해 주세요.");
  for(const [id,position] of Object.entries(layout)) {
    if(!(boardBlockIds.some(key=>key===id)||stickerIds.has(id))||!position||typeof position!=="object"||Array.isArray(position))throw Error("보드 배치를 확인해 주세요.");
    const q=position as Record<string,unknown>;
    if(typeof q.x!=="number"||typeof q.y!=="number"||!Number.isFinite(q.x)||!Number.isFinite(q.y)||Math.abs(q.x)>1600||Math.abs(q.y)>10000)throw Error("보드 위치를 확인해 주세요.");
    if(q.scale!==undefined&&(typeof q.scale!=="number"||!Number.isFinite(q.scale)||q.scale<.3||q.scale>2))throw Error("보드 요소 크기를 확인해 주세요.");
    out.boardLayout[id as BoardBlockId]={x:q.x,y:q.y,...(q.scale!==undefined?{scale:q.scale as number}:{})};
  }
  out.started = v.started;
  out.view = v.view as PlanView;
  out.section = v.section as PlanSection;
  out.selectedPlan = Number(v.selectedPlan);
  return out;
}
export const hasText = (s: string) => !!s.trim();
export function planChecks(p: CityPlan) {
  return [
    {name:"이론 비교",done:[p.theoryCommon,p.theoryTension,p.theoryPriority].every(hasText)},
    {name:"나의 좋은 도시 기준",done:[p.goodCity,p.goodCityReason,p.goodCityCriteria].every(hasText)},
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
  if (hasText(p.declaration)) return p.declaration;
  if (![p.city, p.audience, p.problem, p.promise].every(hasText)) return "";
  return `${p.city}${particle(p.city, "은", "는")} ${p.audience}${particle(p.audience, "을", "를")} 위해 ${p.problem}${particle(p.problem, "을", "를")} 줄이고, ${p.promise}${particle(p.promise, "을", "를")} 목표로 합니다.`;
}
export function selectedSources(p: CityPlan) {
  return [
    ...new Set([...p.theorySources,...p.plans.map((s) => s.source)].filter((s): s is keyof typeof planningSources => !!s)),
  ];
}
export function planReportSections(p: CityPlan) {
  return [
    {title:"이론적 배경과 내가 생각하는 좋은 도시",paragraphs:[
      p.theoryConcepts.length ? "비교를 위해 선택한 교과 개념: " + p.theoryConcepts.map(key=>planningConcepts[key].name).join(", ") : "",
      p.theorySources.length ? "비교를 위해 선택한 연구: " + p.theorySources.map(key=>planningSources[key].name).join(", ") : "",
      p.theoryCommon ? "공통으로 중요하게 본 점: "+p.theoryCommon : "",
      p.theoryTension ? "관점의 차이·상충·보완: "+p.theoryTension : "",
      p.theoryPriority ? "우선할 관점과 이유: "+p.theoryPriority : "",
      p.goodCity ? "좋은 도시의 정의: " + p.goodCity : "",
      p.goodCityReason ? "정의한 근거: " + p.goodCityReason : "",p.goodCityCriteria ? "내 설계의 기준: " + p.goodCityCriteria : "",
    ]},
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
