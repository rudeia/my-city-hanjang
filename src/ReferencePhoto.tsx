import { useRef, useState } from "react";
import type { CityPlan } from "./model";
export function ReferencePhotoView({ plan }: { plan: CityPlan }) {
  return plan.referenceImage ? (
    <figure className="reference-photo">
      <h3>참고한 도시의 위성사진</h3>
      <img
        src={plan.referenceImage}
        alt={plan.referenceTitle || plan.modelCity || "학생이 올린 참고사진"}
        data-reference-image
      />
      <figcaption>
        {plan.referenceTitle || plan.modelCity || "도시·장소 이름 작성 전"}
        <br />
        출처: {plan.referenceSource || "출처를 적어 주세요."}
      </figcaption>
    </figure>
  ) : null;
}
export default function ReferencePhoto({
  plan,
  onChange,
  disabled = false,
}: {
  plan: CityPlan;
  onChange: (plan: CityPlan) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null),
    latest = useRef(plan);
  latest.current = plan;
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setMessage("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10000000) {
      setMessage("10MB 이하의 JPG·PNG·WebP 파일을 골라 주세요.");
      return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(Error("사진을 읽지 못했어요. 다른 이미지 파일을 골라 주세요."));
        image.src = url;
      });
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("이 브라우저에서 사진을 준비하지 못했어요.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      let data = canvas.toDataURL("image/jpeg", 0.82);
      if (data.length > 1400000) data = canvas.toDataURL("image/jpeg", 0.6);
      if (data.length > 1400000)
        throw Error("사진이 너무 커요. 필요한 범위만 캡처해서 다시 올려 주세요.");
      onChange({ ...latest.current, referenceImage: data });
      setMessage("사진을 넣었어요.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "사진을 넣지 못했어요.");
    } finally {
      URL.revokeObjectURL(url);
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <section className="reference-photo-editor">
      <div className="reference-heading">
        <h3>모델 도시의 위성사진</h3>
        <button type="button" onClick={() => input.current?.click()} disabled={disabled || busy}>
          {busy ? "사진 준비 중…" : plan.referenceImage ? "사진 바꾸기" : "사진 올리기"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        data-reference-upload
        hidden
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      {!plan.referenceImage && (
        <button className="photo-dropzone" type="button" onClick={() => input.current?.click()} disabled={disabled || busy}>
          <span aria-hidden="true" className="photo-placeholder">＋</span>
          <span>위성사진 붙이기</span><small>JPG · PNG · WebP · 10MB 이하</small>
        </button>
      )}
      {plan.referenceImage && (
        <>
          <ReferencePhotoView plan={plan} />
          <label htmlFor="reference-title">참고한 도시·장소</label>
          <input
            id="reference-title"
            maxLength={160}
            value={plan.referenceTitle}
            onChange={(event) =>
              onChange({ ...latest.current, referenceTitle: event.target.value })
            }
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled || busy}
            className="reference-remove"
            onClick={() => {
              onChange({ ...latest.current, referenceImage: "" });
              setMessage("참고사진을 지웠어요. 도시 이름과 출처 기록은 남겨 두었어요.");
            }}
          >
            사진 지우기
          </button>
        </>
      )}
      <label htmlFor="reference-source">사진·자료 출처</label>
      <input
        id="reference-source"
        maxLength={600}
        value={plan.referenceSource}
        onChange={(event) => onChange({ ...latest.current, referenceSource: event.target.value })}
        disabled={disabled}
      />
      <p className="tiny" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
