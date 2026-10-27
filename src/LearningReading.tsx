import { planningConcepts, planningSources } from './model';
import { cityCases, conceptGuides, researchGuides, type CityCaseId } from './learning';

function CaseLinks({ids}:{ids:readonly CityCaseId[]}) {
  return <details className="case-links"><summary>공식 사이트에서 사례 살펴보기 <span>{ids.length}</span></summary>
    <div className="case-list">{ids.map(id=>{const c=cityCases[id];return <article className="city-case" key={id}>
      <p className="case-institution">{c.institution} · {c.language}</p>
      <a href={c.url} target="_blank" rel="noreferrer">{c.title} ↗</a>
      <p>{c.description}</p><div className="case-observe"><b>살펴볼 질문</b><p>{c.observe}</p></div>
    </article>})}</div>
  </details>;
}
export function ConceptReading({concept}:{concept:keyof typeof planningConcepts}) {
  const c=planningConcepts[concept],g=conceptGuides[concept];
  return <div className="learning-reading concept-reading">
    <h3>{c.name}</h3><p className="reading-definition">{g.definition}</p>
    <h4>구체적으로 살펴볼 내용</h4><ul>{g.points.map(p=><li key={p}>{p}</li>)}</ul>
    <div className="reading-question"><h4>내 계획에 던질 질문</h4><p>{g.question}</p></div>
    <h4>구분해서 이해할 점</h4><p>{g.distinction}</p>
    <p className="tiny textbook-reference">교과서 연결<br/>{c.textbook}</p>
    <CaseLinks ids={g.cases}/>
  </div>;
}
export function ResearchReading({source}:{source:keyof typeof planningSources}) {
  const s=planningSources[source],g=researchGuides[source];
  return <div className="learning-reading research-reading">
    <p className="reading-type">{s.type} · 수업용 재구성 요약</p><h3>{s.name}</h3>
    <h4>연구 질문</h4><p>{g.question}</p>
    <h4>연구의 성격</h4><p>{g.method}</p>
    <h4>핵심 내용</h4><ul>{g.findings.map(p=><li key={p}>{p}</li>)}</ul>
    <div className="reading-question"><h4>수업에서 적용해 볼 점</h4><p>{g.application}</p></div>
    <h4>적용의 한계</h4><p>{g.limitation}</p>
    <a className="research-original" href={g.reading.url} target="_blank" rel="noreferrer">{g.reading.label} ↗</a>
    <p className="tiny">DOI {s.doi}</p>
    <p className="case-scope">아래 사례는 이론을 적용해 읽어 볼 비교 자료.</p>
    <CaseLinks ids={g.cases}/>
  </div>;
}
