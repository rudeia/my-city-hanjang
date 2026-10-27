import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useDeferredValue,
  useCallback,
  type ReactNode,
} from "react";
import {
  blankDocument as emptyDocument,
  readDocument,
  writeDocument,
  parseActivityFile,
  activityFile,
  type PlanDocument as Draft,
} from "./storage";
import {
  newCityPlan,
  planFields,
  strategyFields,
  planningConcepts,
  planningSources,
  cityDeclaration,
  planChecks,
  planReportSections,
  selectedSources,
  hasText,
  type CityPlan,
  type PlanField,
  type StrategyField,
  type Strategy,
  type PlanSection,
  type PlanView,
} from "./model";
import { makePlanBoard, makePlanReport } from "./board";
import { createSaveQueue } from "./save-queue";
import CityMap from "./CityMap";
import BoardLayoutEditor from "./BoardLayoutEditor";
import {ConceptReading,ResearchReading} from "./LearningReading";
import {conceptGuides,researchGuides} from "./learning";
import ReferencePhoto, { ReferencePhotoView } from "./ReferencePhoto";
import { exampleFor, comparisonQuestions, type WritingExample } from "./examples";
import "./style.css";

const sectionNames: Record<PlanSection, string> = {
  research: "① 개념·연구 검토",
  plans: "② 전략·배치",
  values: "가치·검토",
  brand: "브랜드",
  reflection: "공유·수정",
};
function TextField({
  name,
  label,
  value,
  max,
  onChange,
  short = false,
  help,
  example,
  questions,
}: {
  name: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  short?: boolean;
  help?: string;
  example?: WritingExample;
  questions?: readonly string[];
}) {
  const id = "plan-" + name;
  return (
    <div className="plan-field">
      <label htmlFor={id}>{label}</label>
      {questions && <ul className="writing-questions" id={id+"-questions"} aria-label="작성 질문">{questions.map(q=><li key={q}>{q}</li>)}</ul>}
      {short ? (
        <input
          id={id}
          data-field={name}
          aria-describedby={questions ? id+"-questions" : undefined}
          value={value}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <textarea
          id={id}
          data-field={name}
          aria-describedby={questions ? id+"-questions" : undefined}
          value={value}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {help && <small>{help}</small>}
      {example && (
        <details className="writing-example">
          <summary>작성 예시</summary>
          <p className="example-text">{example.text}</p>
          <p>{example.note}</p>
        </details>
      )}
    </div>
  );
}
type ComparisonColumn={id:string;title:string;values:ReactNode[];reading:ReactNode};
function ComparisonTable({label,rows,columns}:{label:string;rows:string[];columns:ComparisonColumn[]}) {
  if(!columns.length)return <p className="comparison-empty">비교할 항목을 선택하면 여기에 표시됩니다.</p>;
  return <div className="comparison-scroll" tabIndex={0} role="region" aria-label={label+" · 좌우로 비교"}>
    <table className="comparison-table"><caption>{label}</caption><thead><tr><th scope="col">비교 항목</th>{columns.map(c=><th scope="col" key={c.id}>{c.title}</th>)}</tr></thead>
      <tbody>{rows.map((row,i)=><tr key={row}><th scope="row">{row}</th>{columns.map(c=><td key={c.id}>{c.values[i]}</td>)}</tr>)}
      <tr><th scope="row">상세 설명·사례</th>{columns.map(c=><td key={c.id}><details className="comparison-reading"><summary>{c.title} 자세히 보기</summary>{c.reading}</details></td>)}</tr></tbody>
    </table>
  </div>;
}
function TheoryStart({p,change,field}:{p:CityPlan;change:(p:CityPlan)=>void;field:(key:PlanField,short?:boolean)=>ReactNode}) {
  const conceptColumns=p.theoryConcepts.map(key=>({id:key,title:planningConcepts[key].name,values:[conceptGuides[key].definition,conceptGuides[key].question,conceptGuides[key].distinction,planningConcepts[key].textbook],reading:<ConceptReading concept={key}/>}));
  const researchColumns=p.theorySources.map(key=>({id:key,title:planningSources[key].name,values:[researchGuides[key].question,researchGuides[key].method,<ul key="findings">{researchGuides[key].findings.map(t=><li key={t}>{t}</li>)}</ul>,researchGuides[key].application,researchGuides[key].limitation],reading:<ResearchReading source={key}/>}));
  return <div className="theory-start theory-comparison">
    <section className="research-concept">
      <h2>개념을 골라 비교하기</h2>
      <fieldset className="comparison-choices"><legend>비교할 교과 개념 · 여러 개 선택</legend>{Object.entries(planningConcepts).map(([key,c])=><label key={key}><input type="checkbox" checked={p.theoryConcepts.includes(key as keyof typeof planningConcepts)} onChange={e=>change({...p,theoryConcepts:e.target.checked?[...p.theoryConcepts,key as keyof typeof planningConcepts]:p.theoryConcepts.filter(k=>k!==key)})}/><span>{c.name}</span></label>)}</fieldset>
      <ComparisonTable label="교과 개념 비교" rows={["개념의 뜻","설계에서 살필 질문","구분해서 이해할 점","교과서 연결"]} columns={conceptColumns}/>
    </section>
    <section className="research-source">
      <h2>연구의 관점 비교하기</h2>
      <fieldset className="comparison-choices"><legend>비교할 연구 · 여러 개 선택</legend>{Object.entries(planningSources).map(([key,c])=><label key={key}><input type="checkbox" checked={p.theorySources.includes(key as keyof typeof planningSources)} onChange={e=>change({...p,theorySources:e.target.checked?[...p.theorySources,key as keyof typeof planningSources]:p.theorySources.filter(k=>k!==key)})}/><span>{c.name}</span></label>)}</fieldset>
      <ComparisonTable label="연구 관점 비교" rows={["연구 질문","연구의 성격","핵심 내용","내 설계에 적용할 점","적용의 한계"]} columns={researchColumns}/>
    </section>
    <section className="comparison-notes">
      <span className="kicker">비교에서 나의 판단으로</span><h2>여러 관점을 읽고 정리하기</h2><p className="tiny">작성 질문을 따라 자신의 판단을 정리. 예시는 펼쳐 읽는 참고 자료이며 답안에 입력되지 않습니다.</p>
      {field("theoryCommon")}{field("theoryTension")}{field("theoryPriority")}
    </section>

  </div>;
}
function CriteriaStart({p,field}:{p:CityPlan;field:(key:PlanField,short?:boolean)=>ReactNode}) {
  return <div className="theory-start criteria-start">
    <section className="comparison-recap" aria-label="앞에서 비교한 내용">
      <h2>이론 비교 돌아보기</h2>
      <dl>{(["theoryCommon","theoryTension","theoryPriority"] as const).map(key=><div key={key}><dt>{planFields[key].label}</dt><dd>{p[key] || "이론 비교에서 아직 작성하지 않았습니다."}</dd></div>)}</dl>
    </section>
    <section className="good-city-definition">
      <span className="kicker">나의 기준</span><h2>내가 생각하는 좋은 도시는?</h2>
      <p className="tiny">비교한 관점을 근거로 좋은 도시의 정의와 내 설계에서 확인할 기준을 작성하세요.</p>
      {field("goodCity")}{field("goodCityReason")}{field("goodCityCriteria")}
    </section>
  </div>;
}
function GoodCityCriteria({p}:{p:CityPlan}) {
  if(!p.goodCity.trim())return null;
  return <details className="good-city-reminder"><summary>내가 세운 좋은 도시의 기준</summary><p>{p.goodCity}</p>{p.goodCityCriteria && <p>{p.goodCityCriteria}</p>}</details>;
}
function PlanEditor({
  p,
  change,
  field,
}: {
  p: CityPlan;
  change: (p: CityPlan) => void;
  field: (key: PlanField, short?: boolean) => ReactNode;
}) {
  const i = p.selectedPlan,
    s = p.plans[i];
  const strategyField = (key: StrategyField, short = false) => (
    <TextField
      key={key}
      name={`plans.${i}.${key}`}
      label={strategyFields[key].label}
      max={strategyFields[key].max}
      value={s[key]}
      short={short}
      onChange={(value) => updateStrategy({ [key]: value })}
      example={exampleFor(`plans.${i}.${key}`, s.source)}
    />
  );
  function updateStrategy(patch: Partial<Strategy>) {
    change({
      ...p,
      plans: p.plans.map((plan, index) => (index === i ? { ...plan, ...patch } : plan)),
    });
  }
  return (
    <>
      <nav className="plan-section-tabs" aria-label="설계판에서 작성할 부분">
        {Object.entries(sectionNames).map(([key, label]) => (
          <button
            type="button"
            key={key}
            aria-pressed={p.section === key}
            onClick={() => change({ ...p, section: key as PlanSection })}
          >
            {label}
          </button>
        ))}
      </nav>
      {p.section === "research" && (
        <>
          <div className="plan-number-tabs">
            {[0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === i}
                onClick={() => change({ ...p, selectedPlan: n })}
              >
                전략 {n + 1}
              </button>
            ))}
          </div>
          <h2>개념과 연구에서 설계의 근거 찾기</h2>
          <div className="research-layout">
          <section className="research-concept">
            <h3>교과 개념</h3>
            <label htmlFor="planning-concept">적용할 개념</label>
            <select
              id="planning-concept"
              value={s.concept}
              onChange={(e) => updateStrategy({ concept: e.target.value as Strategy["concept"] })}
            >
              <option value="">개념 선택</option>
              {Object.entries(planningConcepts).map(([key, c]) => (
                <option key={key} value={key}>
                  {c.name}
                </option>
              ))}
            </select>
            {s.concept && <ConceptReading concept={s.concept}/>}
          </section>
          <section className="research-source" key={"source-" + i}>
            <h3>연구 근거</h3>
            <label htmlFor="planning-source">참고할 자료</label>
            <select
              id="planning-source"
              value={s.source}
              onChange={(e) => updateStrategy({ source: e.target.value as Strategy["source"] })}
            >
              <option value="">자료 선택</option>
              {Object.entries(planningSources).map(([key, source]) => (
                <option key={key} value={key}>
                  {source.name}
                </option>
              ))}
            </select>
            {s.source && (
              <>
                <ResearchReading source={s.source}/>
                {strategyField("learning")}
                {strategyField("limit")}
              </>
            )}
          </section>
          </div>
          <button className="plan-primary research-next" type="button" onClick={() => change({ ...p, section: "plans" })}>검토한 근거로 전략·배치 작성 →</button>
        </>
      )}
      {p.section === "plans" && <>
        <h2>전략 메모</h2>
        <div className="plan-number-tabs">{[0,1,2].map(n => <button key={n} type="button" aria-pressed={n === i} onClick={() => change({...p, selectedPlan:n})}>전략 {n+1}</button>)}</div>
        {strategyField("action", true)}
        {strategyField("place")}
        {strategyField("reason")}
        <button type="button" onClick={() => change({...p,section:"research"})}>이 전략의 개념·연구 근거 검토</button>
      </>}
      {p.section === "values" && (
        <>
          <h2>무엇을 먼저 지키고, 어떤 부담을 살필까요?</h2>
          {field("values")}
          {field("tradeoff")}
          {field("check")}
        </>
      )}
      {p.section === "brand" && (
        <>
          <h2>계획에 어울리는 이름과 상징은 무엇일까요?</h2>
          {field("slogan", true)}
          {field("keywords", true)}
          {field("mark", true)}
          {field("meaning")}
          <details className="brand-theory"><summary>브랜드의 개념과 연구 살펴보기</summary><ConceptReading concept="branding"/><ResearchReading source="K"/></details>
        </>
      )}
      {p.section === "reflection" && (
        <>
          <h2>친구의 질문을 듣고 계획을 고쳐요.</h2>
          {field("feedback")}
          {field("revision")}
        </>
      )}
    </>
  );
}
function Report({
  p,
  edit,
}: {
  p: CityPlan;
  edit: (section: PlanSection | "theory" | "criteria" | "intro" | "reference", plan?: number) => void;
}) {
  const sections = planReportSections(p);
  return (
    <article className="plan-document">
      <p className="kicker">도시 한 장 · 나의 도시짓기 계획</p>
      <h1>{p.city || "나의 도시"} 계획 보고서</h1>
      {sections.map((section, i) => (
        <section className="report-section" key={section.title}>
          <h2>
            {i + 1}. {section.title}
          </h2>
          {i === 0 && <button type="button" onClick={()=>edit("criteria")}>나의 기준 수정</button>}
          {i === 1 && <ReferencePhotoView plan={p} />}
          {i === 3 ? (
            <>
              {p.plans.map((s, n) => (
                <section className="report-strategy" key={n}>
                  <h3>
                    전략 {n + 1}
                    {s.action ? " · " + s.action : ""}
                  </h3>
                  {[s.place, s.reason].map((value, k) =>
                    value.trim() ? (
                      <p key={k}>{value}</p>
                    ) : (
                      <p className="missing" key={k}>
                        {k === 0 ? "배치할 곳과 연결" : "선택한 이유"} · 아직 작성하지 않았어요.
                      </p>
                    ),
                  )}
                  {s.concept && (
                    <p className="tiny">교과 개념 · {planningConcepts[s.concept].name}</p>
                  )}
                  {s.source && (
                    <>
                      <p className="tiny">선택한 자료 · {planningSources[s.source].name}</p>
                      <p>{s.learning || "자료에서 배운 점과 내 적용을 작성해요."}</p>
                      <p>{s.limit || "적용의 한계를 작성해요."}</p>
                    </>
                  )}
                  <button type="button" onClick={() => edit("plans", n)}>
                    이 전략 수정
                  </button>
                </section>
              ))}
              <CityMap plan={p} readOnly />
            </>
          ) : (
            <>
              {section.paragraphs.some(hasText) ? (
                section.paragraphs.filter(hasText).map((value, n) => <p key={n}>{value}</p>)
              ) : (
                <p className="missing">아직 작성하지 않았어요.</p>
              )}
              <button
                type="button"
                onClick={() =>
                  edit(
                    (["theory", "reference", "intro", "plans", "values", "brand", "reflection"] as const)[i],
                  )
                }
              >
                내용 수정
              </button>
            </>
          )}
        </section>
      ))}
      <footer className="report-sources">
        {selectedSources(p).map((id) => (
          <p key={id}>
            {planningSources[id].name} · DOI {planningSources[id].doi}
          </p>
        ))}
        <p>이 보고서는 도시를 짓기 전의 계획입니다. 운영한 뒤 실제 모습과 비교해 보세요.</p>
      </footer>
    </article>
  );
}

export default function CityStudio() {
  const [envelope, setEnvelope] = useState<Draft>(emptyDocument),
    [initial] = useState(newCityPlan),
    [ready, setReady] = useState(false),
    [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(0),
    [exporting, setExporting] = useState(false),
    [strategyCount, setStrategyCount] = useState(1),
    [message, setMessage] = useState("저장한 기록을 불러오는 중…"),
    [error, setError] = useState(false);
  const latest = useRef(envelope),
    revision = useRef(0),
    exportLock = useRef(false);
  const importInput = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Draft | null>(null);
  const [queue] = useState(() => createSaveQueue<Draft>((snapshot) => writeDocument(snapshot)));
  const p = envelope.planning || initial,
    checks = planChecks(p),
    done = checks.filter((c) => c.done).length;
  const deferred = useDeferredValue(p),
    board = useMemo(() => (deferred.view === "board" ? makePlanBoard(deferred) : null), [deferred]);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => readDocument())
      .then((draft) => {
        if (!active) return;
        latest.current = draft;
        setEnvelope(draft);
        setReady(true);
        setMessage("저장한 활동을 불러왔어요.");
      })
      .catch((e) => {
        if (active) {
          setError(true);
          setMessage(e instanceof Error ? e.message : "기록을 불러오지 못했어요.");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  function change(next: CityPlan) {
    const d = { ...latest.current, planning: next };
    revision.current++;
    latest.current = d;
    setEnvelope(d);
    setDirty(true);
    setError(false);
    setMessage("작성 중 · 잠시 후 자동 저장해요.");
  }
  function show(view: PlanView) {
    change({ ...p, view, started: p.started || ["design", "report", "board"].includes(view) });
  }
  const save = useCallback(
    async (snapshot: Draft, writingRevision: number) => {
      setSaving((n) => n + 1);
      try {
        await queue.enqueue(snapshot);
        if (writingRevision === revision.current) {
          setDirty(false);
          setError(false);
          setMessage("이 브라우저에 저장했어요.");
        }
        return true;
      } catch (e) {
        setError(true);
        setMessage(
          (e instanceof Error ? e.message : "저장하지 못했어요.") +
          " 작성한 글은 화면에 남아 있어요. 활동 파일로도 보관할 수 있어요.",
        );
        return false;
      } finally {
        setSaving((n) => Math.max(0, n - 1));
      }
    },
    [queue],
  );
  useEffect(() => {
    if (!ready || !dirty || exporting) return;
    const timer = setTimeout(
      () => void save(structuredClone(latest.current), revision.current),
      1000,
    );
    return () => clearTimeout(timer);
  }, [envelope, dirty, ready, exporting, save]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const field = (key: PlanField, short = false) => (
    <TextField
      key={key}
      name={key}
      value={p[key]}
      label={planFields[key].label}
      max={planFields[key].max}
      short={short}
      example={exampleFor(key)}
      questions={comparisonQuestions[key]}
      onChange={(value) => change({ ...(latest.current.planning || initial), [key]: value })}
    />
  );
  function begin() {
    const missing = (["city", "audience", "problem", "promise"] as const).find(
      (key) => !p[key].trim(),
    );
    if (missing) {
      setError(true);
      setMessage(`${planFields[missing].label}을 적어 주세요.`);
      document.getElementById("plan-" + missing)?.focus();
      return;
    }
    change({ ...p, view: "design", section: "plans" });
  }
  function edit(section: PlanSection | "theory" | "criteria" | "intro" | "reference", index = 0) {
    if (section === "theory" || section === "criteria" || section === "intro" || section === "reference") show(section);
    else change({ ...p, view: "design", section, selectedPlan: index });
  }
  function downloadActivity() {
    try {
      const snapshot = structuredClone(latest.current);
      const blob = new Blob([activityFile(snapshot)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download =
        (snapshot.planning.city || "나의 도시").replace(/[\\/:*?"<>|]/g, "_") + "_활동.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setError(false);
      setMessage("활동 파일을 저장했어요. 다른 기기에서 이 파일을 열어 이어 쓸 수 있어요.");
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "활동 파일을 만들지 못했어요.");
    }
  }
  async function pickFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error("도시 한 장에서 저장한 활동 파일인지 확인해 주세요.");
      const parsed = parseActivityFile(await file.text());
      if (parsed.planning.referenceImage) {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(Error("활동 파일의 참고사진을 읽지 못했어요. 파일을 다시 확인해 주세요."));
          image.src = parsed.planning.referenceImage;
        });
      }
      setPendingImport(parsed);
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "활동 파일을 읽지 못했어요.");
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  }
  async function importActivity() {
    if (!pendingImport || exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    revision.current++;
    try {
      const next = structuredClone(pendingImport);
      await queue.enqueue(next);
      latest.current = next;
      setEnvelope(next);
      setDirty(false);
      setReady(true);
      setPendingImport(null);
      setError(false);
      setMessage("활동 파일을 불러왔어요. 이 브라우저에서도 이어 쓸 수 있어요.");
    } catch (e) {
      setError(true);
      setMessage(
        e instanceof Error
          ? e.message
          : "불러오지 못했어요. 지금 작성한 내용은 그대로 남아 있어요.",
      );
    } finally {
      exportLock.current = false;
      setExporting(false);
    }
  }
  async function download(kind: "png" | "svg" | "pdf") {
    if (exportLock.current || !ready) return;
    const current = latest.current.planning;
    if (current.referenceImage && !current.referenceSource.trim()) {
      change({ ...current, view: "reference" });
      setError(true);
      setMessage("참고사진의 출처를 먼저 적어 주세요.");
      setTimeout(() => {
        const input = document.getElementById("reference-source");
        input?.focus();
        input?.scrollIntoView({ block: "center" });
      }, 0);
      return;
    }
    exportLock.current = true;
    setExporting(true);
    let svgUrl = "";
    try {
      const snapshot = structuredClone(latest.current),
        rev = revision.current;
      if (!(await save(snapshot, rev))) return;
      const document = snapshot.planning.view === "report" ? makePlanReport(snapshot.planning) : makePlanBoard(snapshot.planning || initial);
      let blob: Blob;
      if (kind === "svg") blob = new Blob([document.svg], { type: "image/svg+xml;charset=utf-8" });
      else {
        await window.document.fonts.ready;
        svgUrl = URL.createObjectURL(
          new Blob([document.svg], { type: "image/svg+xml;charset=utf-8" }),
        );
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(Error("이미지를 그리지 못했어요. SVG 저장을 이용해 주세요."));
          image.src = svgUrl;
        });
        const canvas = window.document.createElement("canvas");
        canvas.width = document.width;
        canvas.height = document.height;
        const context = canvas.getContext("2d");
        if (!context) throw Error("이 기기에서 이미지 저장을 시작하지 못했어요.");
        context.drawImage(image, 0, 0);
        if(kind === "pdf") {
          const {canvasPDF}=await import("./pdf-export");
          blob=canvasPDF(canvas);
        } else blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (value) =>
              value
                ? resolve(value)
                : reject(Error("PNG를 만들지 못했어요. SVG 저장을 이용해 주세요.")),
            "image/png",
          ),
        );
      }
      const url = URL.createObjectURL(blob),
        link = window.document.createElement("a");
      link.href = url;
      link.download =
        (snapshot.planning?.city || "나의 도시").replace(/[\\/:*?"<>|]/g, "_") +
        (snapshot.planning.view === "report" ? "_계획보고서." : "_브랜드보드.") +
        kind;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setError(false);
      setMessage(`${kind.toUpperCase()} 파일을 저장했습니다. 현재 작성 내용과 배치가 반영되었습니다.`);
    } catch (e) {
      setError(true);
      setMessage(
        e instanceof Error ? e.message : "이미지를 저장하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      exportLock.current = false;
      setExporting(false);
    }
  }
  const stageViews = ["theory", "criteria", "reference", "intro", "design", "report", "board"] as const;
  const stageLabels = ["이론 비교", "나의 기준", "모델 도시", "도시 선언", "도시 설계판", "계획 보고서", "브랜드 보드"];
  const stageIndex = stageViews.indexOf(p.view);
  const visibleStrategies = Math.max(strategyCount, p.selectedPlan + 1, p.plans.reduce((n, s, i) => Object.values(s).some(Boolean) ? i + 1 : n, 1));
  return (
    <div className="city-plan-app">
      <header className="city-head">
        <span className="city-wordmark">
          <span aria-hidden="true" className="wordmark-note" />도시 한 장</span>
        <div className="save-actions">
          <span role="status">{!ready ? "불러오는 중" : saving ? "저장 중…" : dirty ? "작성 중" : "저장됨"}</span>
          <button type="button" disabled={!ready || exporting} onClick={() => void save(structuredClone(latest.current), revision.current)}>지금 저장</button>
          <button type="button" disabled={!ready || exporting} onClick={downloadActivity}>활동 파일 저장</button>
          <button type="button" disabled={!ready || exporting} onClick={() => importInput.current?.click()}>활동 파일 열기</button>
          <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={(event) => void pickFile(event.target.files?.[0])} />
        </div>
      </header>
      <nav className="city-view-tabs" aria-label="활동 순서">
        {stageViews.map((view, i) => <button key={view} type="button" aria-label={stageLabels[i]} aria-current={p.view === view ? "step" : undefined} aria-pressed={p.view === view} disabled={!ready || exporting} onClick={() => show(view)}>
          <span className="stage-number">{i + 1}</span>{stageLabels[i]}</button>)}
      </nav>
      <div className={"city-save-message " + (error ? "save-error" : "")} role={error ? "alert" : "status"} aria-live="polite">
        {message}
        {!ready && error && <button type="button" onClick={() => location.reload()}>다시 불러오기</button>}
      </div>
      {pendingImport && <section className="activity-import" role="dialog" aria-label="활동 파일 불러오기">
        <h2>이 활동 파일로 바꿀까요?</h2>
        <p>{pendingImport.planning.city || "도시 이름 미작성"} · 현재 내용은 파일로 보관할 수 있습니다.</p>
        <button type="button" disabled={exporting} onClick={downloadActivity}>현재 내용 파일로 저장</button>
        <button type="button" className="plan-primary" disabled={exporting} onClick={() => void importActivity()}>파일 내용 불러오기</button>
        <button type="button" disabled={exporting} onClick={() => setPendingImport(null)}>취소</button>
      </section>}
      <main>
        <fieldset className="city-work" disabled={!ready || exporting}>
          <div className="page-heading">
            <div>
              <span className="kicker">MY CITY · {String(stageIndex + 1).padStart(2, "0")}</span>
              <h1>{["도시를 계획하는 첫 장", "좋은 도시의 기준 세우기", "모델 도시에서 배울 점", "내 도시의 약속", p.city || "생각을 공간으로", "나의 도시 계획 보고서", "나의 도시, 한 장으로"][stageIndex]}</h1>
            </div>
            {p.view === "theory" && <button className="plan-primary" type="button" onClick={()=>{
              const missing=(["theoryCommon","theoryTension","theoryPriority"] as const).find(key=>!p[key].trim());
              if(missing){setError(true);setMessage(planFields[missing].label+"을 작성해 주세요.");document.getElementById("plan-"+missing)?.focus();return;}
              show("criteria");
            }}>비교를 바탕으로 나의 기준 정리 →</button>}
            {p.view === "criteria" && <button className="plan-primary" type="button" onClick={()=>{
              const missing=(["goodCity","goodCityReason","goodCityCriteria"] as const).find(key=>!p[key].trim());
              if(missing){setError(true);setMessage(planFields[missing].label+"을 작성해 주세요.");document.getElementById("plan-"+missing)?.focus();return;}
              show("reference");
            }}>이 기준으로 모델 도시 살펴보기 →</button>}
            {p.view === "reference" && <button className="plan-primary" type="button" onClick={() => { if (!p.modelCity.trim()) { setError(true); setMessage("참고할 모델 도시의 이름을 적어 주세요."); document.getElementById("plan-modelCity")?.focus(); return; } show("intro"); }}>도시 선언 쓰기 →</button>}
            {p.view === "intro" && <button className="plan-primary" type="button" onClick={begin}>이 약속으로 설계 시작 →</button>}
            {p.view === "design" && p.section !== "research" && <button className="plan-primary" type="button" onClick={() => show("report")}>보고서로 모으기 →</button>}
            {(p.view === "report" || p.view === "board") && <div className="download-buttons">
              <button type="button" className="plan-primary" onClick={() => void download("png")}>{exporting ? "이미지 만드는 중…" : "PNG 이미지 저장"}</button>
              <button type="button" onClick={() => void download("pdf")}>PDF 저장</button>
              <button type="button" onClick={() => void download("svg")}>SVG 원본 저장</button>
            </div>}
          </div>
          {p.view === "theory" && <TheoryStart p={p} change={change} field={field} />}
          {p.view === "criteria" && <><button type="button" className="criteria-back" onClick={()=>show("theory")}>← 이론 비교 수정</button><CriteriaStart p={p} field={field}/></>}
          {(["reference","intro","design"] as string[]).includes(p.view) && <GoodCityCriteria p={p} />}
          {p.view === "reference" && <div className="reference-workbench">
            <section className="photo-paper">
              <ReferencePhoto plan={p} onChange={change} disabled={!ready || exporting} />
            </section>
            <div className="note-stack">
              <section className="sticky-note note-lilac">{field("modelCity", true)}{field("modelReason")}</section>
              <section className="sticky-note note-blue">{field("modelLearn")}</section>
              <section className="sticky-note note-green">{field("modelAdapt")}</section>
            </div>
          </div>}
          {p.view === "intro" && <div className="declaration-workbench">
            <section className="sticky-note note-white">{field("city", true)}</section>
            <section className="sticky-note note-green">{field("audience", true)}</section>
            <section className="sticky-note note-pink">{field("problem")}</section>
            <section className="sticky-note note-blue">{field("promise")}</section>
            <section className="declaration-preview">
              {field("declaration")}
              <p className="tiny">앞에서 정리한 주민·불편·바라는 생활을 연결해 도시의 약속을 적으세요. 작성한 선언문은 보고서와 브랜드 보드에 반영됩니다.</p>
              <details><summary>앞의 메모로 만든 초안 보기</summary><p>{cityDeclaration({...p,declaration:""}) || "주민과 바라는 생활을 먼저 적어 주세요."}</p></details>
            </section>
          </div>}
          {p.view === "design" && <>
            <div className={"design-columns" + (p.section === "research" ? " research-first" : "")}>
              {p.section !== "research" && <div className="design-left">
                <section className="map-paper">
                  <div className="paper-heading">
                    <h2>도시 구상도</h2>
                    <span>5 × 4</span>
                  </div>
                  <CityMap plan={p} onChange={change} disabled={!ready || exporting} />
                </section>
                <div className="strategy-notes" aria-label="전략 메모">{p.plans.slice(0, visibleStrategies).map((strategy, i) => <button type="button" className={"strategy-summary note-" + ["green", "pink", "blue"][i]} aria-pressed={p.section === "plans" && p.selectedPlan === i} key={i} onClick={() => change({ ...p, section: "plans", selectedPlan: i })}>
                  <span>전략 0{i + 1}</span>
                  <b>{strategy.action || "새 전략 메모"}</b>
                </button>)}
                  {visibleStrategies < 3 && <button type="button" className="add-strategy" onClick={() => { setStrategyCount(visibleStrategies + 1); change({ ...p, section: "plans", selectedPlan: visibleStrategies }); }}>＋ 전략 메모 붙이기</button>}
                </div>
              </div>}
              <section className={"plan-editor editor-" + p.section}>
                <PlanEditor p={p} change={change} field={field} />
              </section>
            </div>
            <details className="completion-details">
              <summary>작성 확인 · {done}/{checks.length}</summary>
              <div className="plan-checks">{checks.map(c => <span key={c.name} data-done={c.done}>{c.done ? "✓" : "○"} {c.name}</span>)}</div>
            </details>
          </>}
          {p.view === "report" && <Report p={p} edit={edit} />}
          {p.view === "board" && board && <BoardLayoutEditor plan={p} document={board} onChange={change} disabled={!ready || exporting}/>}
        </fieldset>
      </main>
      <footer className="city-footer">이 브라우저에 자동 저장 · 다른 기기로 옮길 때는 활동 파일 저장</footer>
    </div>
  );
}
