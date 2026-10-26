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
import { makePlanBoard } from "./board";
import { createSaveQueue } from "./save-queue";
import CityMap from "./CityMap";
import ReferencePhoto, { ReferencePhotoView } from "./ReferencePhoto";
import { exampleFor, type WritingExample } from "./examples";
import "./style.css";

const sectionNames: Record<PlanSection, string> = {
  plans: "공간 전략",
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
}: {
  name: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  short?: boolean;
  help?: string;
  example?: WritingExample;
}) {
  const id = "plan-" + name;
  return (
    <div className="plan-field">
      <label htmlFor={id}>{label}</label>
      {short ? (
        <input
          id={id}
          data-field={name}
          value={value}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <textarea
          id={id}
          data-field={name}
          value={value}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <small>{help || `${value.length}/${max}자`}</small>
      {example && (
        <details className="writing-example">
          <summary>어떻게 쓰면 될까요?</summary>
          <p className="example-text">{example.text}</p>
          <p>{example.note}</p>
          <small>가상 도시의 예시예요. 그대로 옮기기보다 내 계획에 맞게 써 보세요.</small>
        </details>
      )}
    </div>
  );
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
      {p.section === "plans" && (
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
          <h2>무엇을 어디에, 왜 둘까요?</h2>
          {strategyField("action", true)}
          {strategyField("place")}
          {strategyField("reason")}
          <label htmlFor="planning-concept">이 전략에 적용할 교과 개념</label>
          <select
            id="planning-concept"
            value={s.concept}
            onChange={(e) => updateStrategy({ concept: e.target.value as Strategy["concept"] })}
          >
            <option value="">개념을 선택해요</option>
            {Object.entries(planningConcepts).map(([key, c]) => (
              <option key={key} value={key}>
                {c.name}
              </option>
            ))}
          </select>
          {s.concept && (
            <div className="concept-lens">
              <b>{planningConcepts[s.concept].name}</b>
              <p>{planningConcepts[s.concept].text}</p>
            </div>
          )}
          <details key={"source-" + i} open={!!s.source}>
            <summary>이 선택을 뒷받침할 연구 자료</summary>
            <p className="tiny">
              전략 하나 이상을 골라, 자료에서 배운 점과 그대로 적용하기 어려운 점을 적어요.
            </p>
            <label htmlFor="planning-source">참고할 자료</label>
            <select
              id="planning-source"
              value={s.source}
              onChange={(e) => updateStrategy({ source: e.target.value as Strategy["source"] })}
            >
              <option value="">자료를 선택해요</option>
              {Object.entries(planningSources).map(([key, source]) => (
                <option key={key} value={key}>
                  {source.name}
                </option>
              ))}
            </select>
            {s.source && (
              <>
                <div className="concept-lens">
                  <b>{planningSources[s.source].name}</b>
                  <p>{planningSources[s.source].text}</p>
                  <p className="tiny">
                    {planningSources[s.source].type} · 교사용 한국어 재구성 시안
                  </p>
                  <a
                    href={"https://doi.org/" + planningSources[s.source].doi}
                    target="_blank"
                    rel="noreferrer"
                  >
                    논문 출처 확인
                  </a>
                </div>
                {strategyField("learning")}
                {strategyField("limit")}
              </>
            )}
          </details>
        </>
      )}
      {p.section === "values" && (
        <>
          <h2>무엇을 먼저 지키고, 어떤 부담을 살필까요?</h2>
          {field("values")}
          {field("tradeoff")}
          {field("check")}
          <div className="concept-lens">
            도시를 운영하기 전에는 결과 대신 확인할 일을 적어요. 프로그램에 없는 수치는 만들어 쓰지
            않아요.
          </div>
        </>
      )}
      {p.section === "brand" && (
        <>
          <h2>계획에 어울리는 이름과 상징은 무엇일까요?</h2>
          {field("slogan", true)}
          {field("keywords", true)}
          {field("mark", true)}
          {field("meaning")}
          <div className="concept-lens">
            <b>도시 정체성과 브랜딩</b>
            <p>{planningConcepts.branding.text}</p>
          </div>
          <details>
            <summary>브랜딩의 이론적 관점</summary>
            <p>{planningSources.K.text}</p>
            <a href={"https://doi.org/" + planningSources.K.doi} target="_blank" rel="noreferrer">
              Kavaratzis(2004) 출처
            </a>
            <p className="tiny">자료를 읽었다면 공간 전략에서 배운 점과 한계도 적어 보세요.</p>
          </details>
        </>
      )}
      {p.section === "reflection" && (
        <>
          <h2>친구의 질문을 듣고 계획을 고쳐요.</h2>
          <p>
            누구를 위한 도시인지, 시설을 왜 그렇게 놓았는지, 이름과 상징에는 무슨 뜻을 담았는지
            설명해 보세요.
          </p>
          {field("feedback")}
          {field("revision")}
          <div className="concept-lens">
            바꾼 내용은 앞의 전략에서도 직접 수정해요. 보고서와 브랜드 보드에 같은 내용이
            들어갑니다.
          </div>
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
  edit: (section: PlanSection | "intro" | "reference", plan?: number) => void;
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
          {i === 0 && <ReferencePhotoView plan={p} />}
          {i === 2 ? (
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
                    (["reference", "intro", "plans", "values", "brand", "reflection"] as const)[i],
                  )
                }
              >
                설계판에서 수정
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
    show("design");
  }
  function edit(section: PlanSection | "intro" | "reference", index = 0) {
    if (section === "intro" || section === "reference") show(section);
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
  async function download(kind: "png" | "svg") {
    if (exportLock.current || !ready) return;
    const current = latest.current.planning;
    if (current.referenceImage && !current.referenceSource.trim()) {
      change({ ...current, view: "design" });
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
      const document = makePlanBoard(snapshot.planning || initial);
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
        blob = await new Promise<Blob>((resolve, reject) =>
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
        "_브랜드보드." +
        kind;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setError(false);
      setMessage(`${kind.toUpperCase()} 이미지를 저장했어요. 지금 보고서에 담긴 내용과 같아요.`);
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
  return (
    <div className="city-plan-app">
      <header className="city-head">
        <div>
          <span className="city-wordmark">도시 한 장</span>
          <p>살고 싶은 도시를 계획하고 한 장으로 소개해요.</p>
        </div>
        <div className="save-actions">
          <span>
            {!ready ? "불러오는 중" : saving ? "저장 중…" : dirty ? "아직 저장 전" : "저장됨"}
          </span>
          <button
            type="button"
            disabled={!ready || exporting}
            onClick={() => void save(structuredClone(latest.current), revision.current)}
          >
            지금 저장
          </button>
          <button type="button" disabled={exporting} onClick={downloadActivity}>
            활동 파일 저장
          </button>
          <button type="button" disabled={exporting} onClick={() => importInput.current?.click()}>
            활동 파일 열기
          </button>
          <input
            ref={importInput}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => void pickFile(event.target.files?.[0])}
          />
        </div>
        {p.started && (
          <nav className="city-view-tabs" aria-label="작성과 결과물">
            {(["design", "report", "board"] as const).map((view, i) => (
              <button
                key={view}
                type="button"
                aria-pressed={p.view === view}
                disabled={!ready || exporting}
                onClick={() => show(view)}
              >
                {["도시 설계판", "계획 보고서", "브랜드 보드"][i]}
              </button>
            ))}
          </nav>
        )}
      </header>
      <div
        className={"city-save-message " + (error ? "save-error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
        {!ready && error && (
          <button type="button" onClick={() => location.reload()}>
            다시 불러오기
          </button>
        )}
      </div>
      {pendingImport && (
        <section className="activity-import" role="dialog" aria-label="활동 파일 불러오기">
          <h2>이 활동 파일로 바꿀까요?</h2>
          <p>
            {pendingImport.planning.city || "도시 이름 미작성"} · 전략{" "}
            {pendingImport.planning.plans.filter((s) => s.action.trim()).length}개 작성
          </p>
          <p>
            현재 작업을 남기려면 먼저 ‘활동 파일 저장’을 누르세요. 불러오면 이 브라우저의 작업이
            파일 내용으로 바뀝니다.
          </p>
          <button type="button" disabled={exporting} onClick={downloadActivity}>
            현재 내용 파일로 저장
          </button>
          <button
            type="button"
            className="plan-primary"
            disabled={exporting}
            onClick={() => void importActivity()}
          >
            파일 내용 불러오기
          </button>
          <button type="button" disabled={exporting} onClick={() => setPendingImport(null)}>
            취소
          </button>
        </section>
      )}
      <main>
        <fieldset className="city-work" disabled={!ready || exporting}>
          {p.view === "reference" && (
            <div className="city-intro">
              <section className="intro-copy">
                <p className="kicker">1 · 모델 도시 살펴보기</p>
                <h1>
                  어떤 도시에서
                  <br />
                  배워 볼까요?
                </h1>
                <p>
                  배치나 생활 모습이 궁금한 실제 도시를 골라 보세요. 위성사진과 자료를 살펴보고, 내
                  도시에 가져올 점과 바꿔 볼 점을 찾아요.
                </p>
                <ol>
                  <li>
                    <b>모델 도시</b>관찰하고 배울 점 찾기
                  </li>
                  <li>
                    <b>내 도시 선언</b>누구를 위한 도시인지 정하기
                  </li>
                  <li>
                    <b>설계와 표현</b>배치하고 글과 보드로 소개하기
                  </li>
                </ol>
                <div className="concept-lens">
                  <b>살기 좋은 도시를 보는 관점</b>
                  <p>
                    시설이 많아 보인다는 이유만으로 모두에게 살기 좋다고 판단하기는 어려워요. 주민의
                    생활과 실제 이용 조건도 살펴보세요.
                  </p>
                </div>
              </section>
              <section className="plan-panel">
                <h2>나의 모델 도시</h2>
                {field("modelCity", true)}
                {field("modelReason")}
                <ReferencePhoto plan={p} onChange={change} disabled={!ready || exporting} />
                {field("modelLearn")}
                {field("modelAdapt")}
                <div className="plan-actions">
                  <button
                    type="button"
                    className="plan-primary"
                    onClick={() => {
                      if (!p.modelCity.trim()) {
                        setError(true);
                        setMessage("참고할 모델 도시의 이름을 적어 주세요.");
                        document.getElementById("plan-modelCity")?.focus();
                        return;
                      }
                      show("intro");
                    }}
                  >
                    이 도시를 참고해 나의 도시 선언 쓰기 →
                  </button>
                  <button type="button" onClick={() => show("design")}>
                    설계판 먼저 살펴보기
                  </button>
                </div>
              </section>
            </div>
          )}
          {p.view === "intro" && (
            <div className="city-intro">
              <section className="intro-copy">
                <p className="kicker">2 · 나의 도시 선언</p>
                <button type="button" onClick={() => show("reference")}>
                  모델 도시 다시 보기
                </button>
                <h1>
                  어떤 도시에서
                  <br />
                  살고 싶나요?
                </h1>
                <p>
                  누가 살 도시인지, 무엇이 편해지면 좋을지 적어 보세요. 그 생각을 시설 배치와 도시
                  이름으로 구체화해 봐요.
                </p>
                <ol>
                  <li>
                    <b>도시 선언</b>누구를 위한 도시인지 정하기
                  </li>
                  <li>
                    <b>도시 설계판</b>시설을 놓고 선택한 이유 쓰기
                  </li>
                  <li>
                    <b>보고서와 보드</b>같은 계획을 글과 이미지로 보기
                  </li>
                </ol>
                <div className="concept-lens">
                  <b>거주 적합성</b>
                  <p>{planningConcepts.livability.text}</p>
                </div>
              </section>
              <section className="plan-panel">
                <p className="kicker">나의 첫 도시 선언</p>
                <div className="declaration-preview">
                  {cityDeclaration(p) ||
                    "아래 네 가지를 적으면 도시의 첫 약속이 한 문장으로 모여요."}
                </div>
                {(["city", "audience", "problem", "promise"] as const).map((key) =>
                  field(key, true),
                )}
                <div className="plan-actions">
                  <button className="plan-primary" type="button" onClick={begin}>
                    이 약속으로 설계 시작 →
                  </button>
                  <button type="button" onClick={() => show("design")}>
                    빈 설계판 먼저 보기
                  </button>
                </div>
              </section>
            </div>
          )}
          {p.view === "design" && (
            <>
              <div className="design-top">
                <p>
                  {done}/{checks.length} 부분 작성 · 점수가 아닌 작성 상태예요
                </p>
                <button type="button" onClick={() => show("intro")}>
                  도시 선언 고치기
                </button>
              </div>
              <section className="plan-overview">
                <p className="kicker">우리 도시의 출발점</p>
                {p.modelCity && (
                  <p className="tiny">
                    참고한 모델 도시: {p.modelCity}{" "}
                    <button type="button" onClick={() => show("reference")}>
                      자료와 사진 보기
                    </button>
                  </p>
                )}
                <h1>{p.city || "도시 이름을 먼저 정해요"}</h1>
                <div className="declaration-chain">
                  {[
                    ["누구의", p.audience, "주민을 작성해요"],
                    ["어떤 불편을", p.problem, "불편을 작성해요"],
                    ["어떤 생활로", p.promise, "바라는 생활을 작성해요"],
                  ].map(([label, value, empty]) => (
                    <div key={label}>
                      <small>{label}</small>
                      <p>{value || empty}</p>
                    </div>
                  ))}
                </div>
              </section>
              <div className="design-columns">
                <section className="plan-panel">
                  <h2>내가 그리는 공간 구상</h2>
                  <CityMap plan={p} onChange={change} disabled={!ready || exporting} />
                  <ReferencePhoto plan={p} onChange={change} disabled={!ready || exporting} />
                  <h2 className="strategies-heading">도시를 만드는 전략 3개</h2>
                  {p.plans.map((strategy, i) => (
                    <button
                      type="button"
                      className="strategy-summary"
                      aria-pressed={p.section === "plans" && p.selectedPlan === i}
                      key={i}
                      onClick={() => change({ ...p, section: "plans", selectedPlan: i })}
                    >
                      <b>
                        {i + 1}. {strategy.action || "아직 정하지 않은 공간 전략"}
                      </b>
                      <small>
                        {strategy.concept
                          ? planningConcepts[strategy.concept].name
                          : "개념 선택 전"}{" "}
                        · {strategy.reason ? "이유 작성됨" : "배치와 이유를 채워요"}
                      </small>
                    </button>
                  ))}
                  <div className="plan-checks">
                    {checks.map((c) => (
                      <span key={c.name} data-done={c.done}>
                        {c.done ? "✓" : "○"} {c.name}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="plan-panel plan-editor">
                  <PlanEditor p={p} change={change} field={field} />
                  <div className="plan-actions">
                    <button type="button" onClick={() => show("report")}>
                      보고서로 읽기
                    </button>
                    <button type="button" onClick={() => show("board")}>
                      보드에서 확인
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {p.view === "report" && (
            <>
              <div className="output-actions">
                <p>지금까지 쓴 글과 구상도를 모았어요. 읽어 보고 빠진 부분을 고쳐 보세요.</p>
                <button type="button" onClick={() => show("board")}>
                  브랜드 보드로 보기 →
                </button>
              </div>
              <Report p={p} edit={edit} />
            </>
          )}
          {p.view === "board" && (
            <>
              <div className="output-actions">
                <p>보고서의 도시 계획을 한 장으로 소개해요.</p>
                <div>
                  <button
                    type="button"
                    className="plan-primary"
                    onClick={() => void download("png")}
                  >
                    {exporting ? "이미지 만드는 중…" : "PNG 이미지 저장"}
                  </button>
                  <button type="button" onClick={() => void download("svg")}>
                    SVG 원본 저장
                  </button>
                  <button type="button" onClick={() => show("report")}>
                    원문 보고서
                  </button>
                </div>
              </div>
              <div
                className="plan-board-image"
                aria-label="브랜드 보드 미리보기"
                dangerouslySetInnerHTML={board ? { __html: board.svg } : undefined}
              />
            </>
          )}
        </fieldset>
      </main>
      <footer className="city-footer">
        작성 내용은 이 브라우저에 저장됩니다. 다른 기기에서 이어 쓰려면 활동 파일을 저장해 옮기세요.
      </footer>
    </div>
  );
}
