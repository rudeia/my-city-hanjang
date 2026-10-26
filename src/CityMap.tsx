import { useState, type CSSProperties } from "react";
import {
  COLS,
  ROWS,
  facilityNames,
  roadEdges,
  junctionUsed,
  setRoad,
  type CityPlan,
  type Facility,
} from "./model";
import { cityMapSVG } from "./board";
type Tool = Facility | "road" | "erase";
export default function CityMap({
  plan,
  onChange,
  disabled = false,
  readOnly = false,
}: {
  plan: CityPlan;
  onChange?: (plan: CityPlan) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [tool, setTool] = useState<Tool>(""),
    [strategy, setStrategy] = useState<number | null>(null),
    [notice, setNotice] = useState("요소를 고른 뒤 큰 칸에, 도로는 칸 사이 통로에 놓아요.");
  const roads = new Set(plan.roads);
  if (readOnly)
    return (
      <figure className="plan-map-readonly">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 504 408"
          role="img"
          aria-label="학생이 배치한 시설과 칸 사이 도로망"
          dangerouslySetInnerHTML={{ __html: cityMapSVG(plan) }}
        />
        <figcaption>
          시설은 큰 칸에, 도로는 칸 사이에 놓았어요. 거리와 시간은 따로 확인해야 해요.
        </figcaption>
      </figure>
    );
  const roadTool = tool === "road" || tool === "erase";
  function place(index: number) {
    if (!onChange || disabled) return;
    if (!tool) {
      setNotice("먼저 놓을 시설을 골라 주세요.");
      return;
    }
    if (tool === "road") {
      setNotice("도로는 큰 칸 사이의 가느다란 통로를 눌러 놓아요.");
      return;
    }
    const cells = plan.cells.map((c, i) =>
      i === index
        ? tool === "erase"
          ? { type: "" as Facility, strategy: null }
          : { type: tool, strategy }
        : c,
    );
    onChange({ ...plan, cells });
    setNotice(
      tool === "erase"
        ? "시설을 지웠어요. 도로는 그대로입니다."
        : `${facilityNames[tool]} 시설을 놓았어요.`,
    );
  }
  function road(id: string) {
    if (!onChange || disabled || !roadTool) return;
    const present = tool === "road" && !roads.has(id);
    onChange(setRoad(plan, id, present));
    setNotice(
      present
        ? "칸 사이 통로에 도로를 연결했어요. 시설은 그대로입니다."
        : "도로 구간을 지웠어요. 시설은 그대로입니다.",
    );
  }
  const position = (row: number, col: number): CSSProperties => ({ gridRow: row, gridColumn: col });
  return (
    <div className="plan-map-editor">
      <div className="map-tools" aria-label="놓을 요소">
        {Object.entries(facilityNames).map(([key, name]) => (
          <button
            type="button"
            key={key}
            aria-pressed={tool === key}
            onClick={() => {
              setTool(key as Facility);
              setNotice(`${name}을 놓을 큰 칸을 눌러 주세요.`);
            }}
            disabled={disabled}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={tool === "road"}
          onClick={() => {
            setTool("road");
            setNotice("칸 사이 통로를 눌러 도로를 연결하거나 해제해요. 큰 칸은 시설용입니다.");
          }}
          disabled={disabled}
        >
          도로망
        </button>
        <button
          type="button"
          aria-pressed={tool === "erase"}
          onClick={() => {
            setTool("erase");
            setNotice("지울 시설 칸이나 도로 구간을 눌러 주세요.");
          }}
          disabled={disabled}
        >
          지우기
        </button>
      </div>
      <label className="strategy-label">
        시설에 표시할 전략 번호
        <select
          value={strategy ?? ""}
          onChange={(e) => setStrategy(e.target.value === "" ? null : Number(e.target.value))}
          disabled={disabled}
        >
          <option value="">선택 안 함</option>
          {[0, 1, 2].map((i) => (
            <option value={i} key={i}>
              전략 {i + 1}
            </option>
          ))}
        </select>
      </label>
      <div
        className={"facility-grid " + (roadTool ? "road-mode" : "")}
        aria-label="5열 4행의 시설 칸과 칸 사이 도로망"
      >
        {Array.from({ length: (ROWS + 1) * (COLS + 1) }, (_, i) => {
          const row = Math.floor(i / (COLS + 1)),
            col = i % (COLS + 1);
          return (
            <span
              key={"j" + i}
              className={"road-junction " + (junctionUsed(roads, row, col) ? "present" : "")}
              style={position(row * 2 + 1, col * 2 + 1)}
              aria-hidden="true"
            />
          );
        })}
        {roadEdges.map((edge) => (
          <button
            key={edge.id}
            type="button"
            data-road={edge.id}
            className={
              "road-edge road-" + edge.orientation + (roads.has(edge.id) ? " present" : "")
            }
            style={position(
              edge.row * 2 + (edge.orientation === "h" ? 1 : 2),
              edge.col * 2 + (edge.orientation === "h" ? 2 : 1),
            )}
            aria-label={`${edge.orientation === "h" ? "가로" : "세로"} 도로 ${edge.row + 1}-${edge.col + 1}`}
            aria-pressed={roads.has(edge.id)}
            disabled={disabled || !roadTool}
            onClick={() => road(edge.id)}
          />
        ))}
        {plan.cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            data-cell={i}
            data-type={cell.type}
            className="facility-cell"
            style={position(Math.floor(i / COLS) * 2 + 2, (i % COLS) * 2 + 2)}
            aria-label={`${Math.floor(i / COLS) + 1}행 ${(i % COLS) + 1}열 ${cell.type ? facilityNames[cell.type] : "빈 시설 칸"}${cell.strategy !== null ? ", 전략 " + (cell.strategy + 1) : ""}`}
            disabled={disabled}
            onClick={() => place(i)}
          >
            <span>{cell.type ? facilityNames[cell.type] : "+"}</span>
            {cell.type && cell.strategy !== null && <small>전략 {cell.strategy + 1}</small>}
          </button>
        ))}
      </div>
      <p className="map-notice" role="status" aria-live="polite">
        {notice}
      </p>
      <p className="tiny">
        시설 {plan.cells.filter((c) => c.type).length}/20칸 · 도로 {plan.roads.length}구간 · 도로는
        시설 칸을 차지하지 않아요.
      </p>
    </div>
  );
}
