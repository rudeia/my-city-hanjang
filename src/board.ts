import { xml, lines, type BoardDocument } from "./svg-text";
import {
  COLS,
  ROWS,
  roadEdges,
  facilityNames,
  cityDeclaration,
  selectedSources,
  planningConcepts,
  planningSources,
  planChecks,
  type CityPlan,
} from "./model";
const ink = "#173f32",
  sub = "#53685a",
  line = "#d0dbcf",
  paper = "#fffdf7",
  soft = "#e4eddd";
const colors = {
  home: "#dce8ed",
  service: "#f2d3a1",
  park: soft,
  work: "#efdfe0",
  landmark: "#d5e6ce",
};
const font = "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
function rect(x: number, y: number, w: number, h: number, fill: string, r = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
}
function text(value: string, x: number, y: number, size: number, color = ink, weight = 400) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${xml(value)}</text>`;
}
function paragraph(
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  color = ink,
  weight = 400,
) {
  const rows = value.split("\n").flatMap((v) => lines(v, width, size)),
    height = rows.length * size * 1.65;
  return {
    svg: rows.map((v, i) => text(v, x, y + i * size * 1.65, size, color, weight)).join(""),
    height,
  };
}
/** The same facility cells and separate road edges drive preview, report, SVG and PNG. */
export function cityMapSVG(p: CityPlan, x = 0, y = 0, width = 504) {
  const roadSet = new Set(p.roads);
  let s = rect(0, 0, 504, 408, "#eef1eb", 14);
  for (const edge of roadEdges) {
    const [r, c] = edge.from,
      [r2, c2] = edge.to;
    const on = roadSet.has(edge.id);
    s += `<line data-road="${edge.id}" data-present="${on}" x1="${12 + c * 96}" y1="${12 + r * 96}" x2="${12 + c2 * 96}" y2="${12 + r2 * 96}" stroke="${on ? "#526857" : "#d4ded2"}" stroke-width="${on ? 12 : 2}" stroke-linecap="round"${on ? "" : ' stroke-dasharray="3 6"'}/>`;
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c,
        cell = p.cells[index],
        cx = 24 + c * 96,
        cy = 24 + r * 96;
      s += `<g data-cell="${index}" data-type="${cell.type}">${rect(cx, cy, 72, 72, cell.type ? colors[cell.type] : paper, 8)}`;
      if (cell.type) {
        s += text(facilityNames[cell.type], cx + 8, cy + 31, 12, ink, 500);
        if (cell.strategy !== null)
          s += text(`전략 ${cell.strategy + 1}`, cx + 8, cy + 54, 10, sub);
      }
      s += "</g>";
    }
  return `<g transform="translate(${x} ${y}) scale(${width / 504})">${s}</g>`;
}
export function makePlanBoard(p: CityPlan): BoardDocument {
  const width = 1600,
    pad = 72,
    inner = width - pad * 2;
  let y = 88,
    s = rect(0, 0, width, 14, ink);
  const add = (value: string, size: number, color = ink, weight = 400, w = inner, x = pad) => {
    const part = paragraph(value, x, y, w, size, color, weight);
    s += part.svg;
    y += part.height;
  };
  add("도시 한 장 · 나의 도시 브랜드 보드", 23, sub, 500);
  y += 30;
  if (p.mark) {
    s += `<circle cx="1455" cy="174" r="56" fill="${soft}"/><text x="1455" y="185" text-anchor="middle" font-size="${Array.from(p.mark).length > 3 ? 22 : 30}" fill="${ink}">${xml(p.mark)}</text>`;
  }
  add(p.city || "도시 이름 작성 전", 78, ink, 600, p.mark ? 1250 : inner);
  y += 8;
  add(p.slogan || "슬로건 작성 전", 37, sub, 500);
  y += 8;
  if (p.keywords.trim()) {
    add(p.keywords, 25, ink, 500);
    y += 20;
  }
  add(cityDeclaration(p) || "도시 선언을 쓰면 여기에 표시돼요.", 31);
  y += 30;
  const top = y,
    mapWidth = 680,
    splitX = 820,
    rightWidth = 708;
  s += text("우리가 계획한 공간", pad, top, 27, ink, 500);
  s += cityMapSVG(p, pad, top + 24, mapWidth);
  const legend = paragraph(
    "시설은 큰 칸, 도로는 칸 사이에 놓았어요. 거리와 시간은 따로 확인해요.",
    pad,
    top + (mapWidth * 408) / 504 + 70,
    mapWidth,
    20,
    sub,
  );
  s += legend.svg;
  let ry = top;
  s += text("약속을 만드는 세 전략", splitX, ry, 27, ink, 500);
  ry += 48;
  p.plans.forEach((strategy, i) => {
    s += rect(splitX, ry - 14, rightWidth, 2, line);
    ry += 20;
    const title = paragraph(
      `${i + 1}. ${strategy.action || "공간 전략 작성 전"}`,
      splitX,
      ry,
      rightWidth,
      28,
      ink,
      500,
    );
    s += title.svg;
    ry += title.height + 10;
    if (strategy.place) {
      const place = paragraph(strategy.place, splitX, ry, rightWidth, 23);
      s += place.svg;
      ry += place.height + 9;
    }
    if (strategy.concept) {
      const label = paragraph(
        planningConcepts[strategy.concept].name +
          (strategy.source ? " · " + planningSources[strategy.source].name : ""),
        splitX,
        ry,
        rightWidth,
        19,
        sub,
      );
      s += label.svg;
      ry += label.height + 10;
    }
    ry += 23;
  });
  y = Math.max(ry, top + (mapWidth * 408) / 504 + 85 + legend.height) + 40;
  const columnWidth = 680;
  const note = (heading: string, value: string, x: number) => {
    let cy = y;
    s += text(heading, x, cy, 25, ink, 500);
    cy += 44;
    const body = paragraph(
      value || "아직 작성하지 않았어요.",
      x,
      cy,
      columnWidth,
      24,
      value ? ink : sub,
    );
    s += body.svg;
    return cy + body.height;
  };
  const a = note("이름과 상징의 의미", p.meaning, pad),
    b = note("계획에서 고려할 점", p.tradeoff, splitX);
  y = Math.max(a, b) + 42;
  if (p.check) {
    add("도시를 지으며 확인할 것", 25, ink, 500);
    y += 10;
    add(p.check, 23, sub);
    y += 30;
  }
  if (p.modelCity) {
    add("참고한 모델 도시 · " + p.modelCity, 25, ink, 500);
    y += 12;
    if (p.modelLearn) {
      add(p.modelLearn, 23, sub);
      y += 18;
    }
    if (p.modelAdapt) {
      add("내 도시에서 바꿔 볼 점: " + p.modelAdapt, 23, sub);
      y += 18;
    }
  }
  if (p.modelCity && p.referenceSource && !p.referenceImage) {
    add("참고자료: " + p.referenceSource, 20, sub);
    y += 18;
  }
  if (p.referenceImage) {
    add("참고한 도시의 위성사진", 25, ink, 500);
    y += 12;
    s += `<image href="${p.referenceImage}" x="${pad}" y="${y}" width="${inner}" height="420" preserveAspectRatio="xMidYMid meet"/>`;
    y += 456;
    add(p.referenceTitle || p.modelCity || "도시·장소 이름 작성 전", 23, ink, 500);
    add("출처: " + (p.referenceSource || "출처 작성 전"), 20, sub);
    y += 12;
    add("실제 도시를 살펴보는 참고자료입니다. 위의 공간 구상도와 구분해 읽어 주세요.", 20, sub);
    y += 30;
  }
  s += rect(pad, y, inner, 2, line);
  y += 44;
  const chosen = selectedSources(p);
  if (chosen.length) {
    add("선택한 참고 자료", 20, sub, 500);
    for (const id of chosen)
      add(`${planningSources[id].name} · DOI ${planningSources[id].doi}`, 19, sub);
    y += 18;
  }
  const done = planChecks(p).filter((c) => c.done).length;
  add(
    `작성 상태 ${done}/${planChecks(p).length} · 도시를 짓기 전의 계획입니다. 운영한 뒤 실제 모습과 비교해 보세요.`,
    19,
    sub,
  );
  y += 35;
  const height = Math.ceil(Math.max(1500, y));
  return {
    name: "브랜드 보드",
    width,
    height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${xml(p.city || "나의 도시")} · 브랜드 보드</title><desc>보고서와 같은 학생 작성 내용, 시설 구상도와 칸 사이 도로망</desc><style>text{font-family:${font};font-kerning:normal}</style>${rect(0, 0, width, height, paper)}${s}</svg>`,
  };
}
