"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { CopyButton } from "@/components/client-ui";
import { ToolPanel } from "@/components/ui";
import { gradientCss, type GradientKind, type RadialShape } from "../_lib/gradient";
import { Field, Note, Tabs, Warn, pick } from "./ui";

/**
 * 渐变生成器引擎:色标(2–5)、类型(线性/径向/锥形)、角度滑杆、
 * 实时预览与 CSS 输出。字符串数学全部在 _lib/gradient.ts(纯,已测);
 * 引擎只做状态编排,不写一行颜色数学。
 */

type StopDraft = { color: string; position: number | null };

const DEFAULT_STOPS: StopDraft[] = [
  { color: "#0EA5E9", position: null },
  { color: "#8B5CF6", position: null },
];

const PRESETS = [
  { key: "pAurora", colors: ["#06B6D4", "#3B82F6", "#8B5CF6"] },
  { key: "pCitrus", colors: ["#FDE047", "#F97316", "#DC2626"] },
  { key: "pMatcha", colors: ["#BBF7D0", "#34D399", "#047857"] },
  { key: "pBlush", colors: ["#FDA4AF", "#F472B6", "#C084FC"] },
  { key: "pSlate", colors: ["#0F172A", "#334155", "#94A3B8", "#F1F5F9"] },
] as const;

const L: Record<string, Record<string, string>> = {
  stops: { en: "Color stops", zh: "色标", ja: "カラー ストップ", es: "Paradas de color", pt: "Paradas de cor" },
  position: { en: "Position", zh: "位置", ja: "位置", es: "Posición", pt: "Posição" },
  auto: { en: "auto", zh: "自动", ja: "自動", es: "auto", pt: "auto" },
  kind: { en: "Gradient type", zh: "渐变类型", ja: "グラデーション種別", es: "Tipo de degradado", pt: "Tipo de gradiente" },
  linear: { en: "Linear", zh: "线性", ja: "線形", es: "Lineal", pt: "Linear" },
  radial: { en: "Radial", zh: "径向", ja: "円形", es: "Radial", pt: "Radial" },
  conic: { en: "Conic", zh: "锥形", ja: "円錐", es: "Cónico", pt: "Cônico" },
  angle: { en: "Angle", zh: "角度", ja: "角度", es: "Ángulo", pt: "Ângulo" },
  fromAngle: { en: "From angle", zh: "起始角度", ja: "開始角度", es: "Ángulo inicial", pt: "Ângulo inicial" },
  shape: { en: "Shape", zh: "形状", ja: "形状", es: "Forma", pt: "Forma" },
  circle: { en: "Circle", zh: "圆形", ja: "円", es: "Círculo", pt: "Círculo" },
  ellipse: { en: "Ellipse", zh: "椭圆", ja: "楕円", es: "Elipse", pt: "Elipse" },
  preview: { en: "Live preview", zh: "实时预览", ja: "ライブプレビュー", es: "Vista previa en vivo", pt: "Pré-visualização ao vivo" },
  output: { en: "CSS output", zh: "CSS 输出", ja: "CSS 出力", es: "Salida CSS", pt: "Saída CSS" },
  addStop: { en: "Add color", zh: "添加颜色", ja: "色を追加", es: "Añadir color", pt: "Adicionar cor" },
  remove: { en: "Remove", zh: "移除", ja: "削除", es: "Quitar", pt: "Remover" },
  presets: { en: "Preset palettes", zh: "预设配色", ja: "プリセットパレット", es: "Paletas predefinidas", pt: "Paletas predefinidas" },
  reset: { en: "Auto positions", zh: "自动位置", ja: "自動位置", es: "Posiciones automáticas", pt: "Posições automáticas" },
  maxStops: {
    en: "Five stops is the maximum.",
    zh: "最多 5 个色标。",
    ja: "ストップは最大 5 個です。",
    es: "El máximo son cinco paradas.",
    pt: "O máximo são cinco paradas.",
  },
  invalid: {
    en: "A gradient needs at least two colors; keep every position between 0 and 100.",
    zh: "渐变至少需要两个颜色;位置需在 0–100 之间。",
    ja: "グラデーションには色が 2 つ以上必要です。位置は 0〜100 で指定してください。",
    es: "Un degradado necesita al menos dos colores; mantén cada posición entre 0 y 100.",
    pt: "Um gradiente precisa de pelo menos duas cores; mantenha cada posição entre 0 e 100.",
  },
  pAurora: { en: "Aurora", zh: "极光", ja: "オーロラ", es: "Aurora", pt: "Aurora" },
  pCitrus: { en: "Citrus", zh: "柑橘", ja: "シトラス", es: "Cítricos", pt: "Cítricos" },
  pMatcha: { en: "Matcha", zh: "抹茶", ja: "抹茶", es: "Matcha", pt: "Matcha" },
  pBlush: { en: "Blush", zh: "腮红", ja: "ブラッシュ", es: "Rubor", pt: "Blush" },
  pSlate: { en: "Slate", zh: "岩灰", ja: "スレート", es: "Pizarra", pt: "Ardósia" },
  hint: {
    en: "Leave positions on auto to let CSS distribute the stops evenly; the angle runs clockwise from 0° pointing up.",
    zh: "位置保持“自动”即可让 CSS 均匀分布色标;角度从 0°(朝上)顺时针递增。",
    ja: "位置を「自動」のままにすると CSS が等間隔で配置します。角度は 0°(上向き)から時計回りです。",
    es: "Deja las posiciones en automático para que CSS las reparta de forma uniforme; el ángulo avanza en sentido horario desde 0° (arriba).",
    pt: "Deixe as posições no automático para o CSS distribuir as paradas uniformemente; o ângulo avança no sentido horário a partir de 0° (para cima).",
  },
};

function cssBlock(gradient: string, fallback: string): string {
  return [
    `background-color: ${fallback}; /* fallback */`,
    `background-image: -webkit-${gradient};`,
    `background-image: ${gradient};`,
  ].join("\n");
}

export function GradientMakerEngine() {
  const { locale, t } = useI18n();
  const [stops, setStops] = useState<StopDraft[]>(DEFAULT_STOPS);
  const [kind, setKind] = useState<GradientKind>("linear");
  const [angle, setAngle] = useState(45);
  const [shape, setShape] = useState<RadialShape>("circle");
  const [notice, setNotice] = useState("");

  const gradient = useMemo(() => {
    if (stops.length < 2 || stops.some((s) => s.color.trim() === "")) return null;
    return gradientCss(
      stops.map((s) => ({ color: s.color, position: s.position === null ? undefined : s.position })),
      kind,
      kind === "radial" ? 0 : angle,
      shape,
    );
  }, [stops, kind, angle, shape]);

  const fallback = stops[0]?.color.trim() || "#333333";
  const block = gradient ? cssBlock(gradient, fallback) : "";

  const setStop = (i: number, patch: Partial<StopDraft>) =>
    setStops((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const addStop = () => {
    if (stops.length >= 5) {
      setNotice(pick(locale, L.maxStops));
      return;
    }
    setNotice("");
    setStops((prev) => [...prev, { color: "#94A3B8", position: null }]);
  };

  const removeStop = (i: number) => {
    setNotice("");
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((_, j) => j !== i)));
  };

  const angleLabel = kind === "conic" ? pick(locale, L.fromAngle) : pick(locale, L.angle);

  return (
    <ToolPanel>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--color-sub)]">{pick(locale, L.stops)}</p>
          <div className="space-y-2">
            {stops.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border hairline px-3 py-2">
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(s.color.trim()) ? s.color.trim().toLowerCase() : "#94a3b8"}
                  onChange={(e) => setStop(i, { color: e.target.value })}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
                  aria-label={`${pick(locale, L.stops)} ${i + 1}`}
                />
                <input
                  type="text"
                  className="field mono w-24 shrink-0"
                  value={s.color}
                  onChange={(e) => setStop(i, { color: e.target.value })}
                  placeholder="#0EA5E9"
                  spellCheck={false}
                  aria-label={`${pick(locale, L.stops)} ${i + 1} hex`}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.position ?? 0}
                  onChange={(e) => setStop(i, { position: +e.target.value })}
                  className="min-w-0 flex-1"
                  aria-label={`${pick(locale, L.position)} ${i + 1}`}
                />
                <span className="mono w-16 shrink-0 text-right text-[12.5px] text-[var(--color-sub)]">
                  {s.position === null ? pick(locale, L.auto) : `${s.position}%`}
                </span>
                <button
                  type="button"
                  onClick={() => setStop(i, { position: null })}
                  className="rounded-full border hairline px-2 py-0.5 text-[11.5px] font-medium text-[var(--color-sub)] hover:bg-[var(--color-surface)]"
                  aria-label={`${pick(locale, L.reset)} ${i + 1}`}
                >
                  {pick(locale, L.auto)}
                </button>
                <button
                  type="button"
                  onClick={() => removeStop(i)}
                  disabled={stops.length <= 2}
                  aria-label={`${pick(locale, L.remove)} ${i + 1}`}
                  className="h-7 w-7 flex-none rounded-full text-[14px] leading-none text-[var(--color-sub)] hover:bg-[var(--color-surface)] disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStop}
            disabled={stops.length >= 5}
            className="mt-2 rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)] disabled:opacity-40"
          >
            + {pick(locale, L.addStop)}
          </button>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--color-sub)]">{pick(locale, L.presets)}</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setNotice("");
                  setStops(p.colors.map((c) => ({ color: c, position: null })));
                }}
                aria-label={pick(locale, L[p.key])}
                className="flex items-center gap-2 rounded-full border hairline py-1 pl-1.5 pr-3.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className="flex" aria-hidden>
                  {p.colors.map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="inline-block h-4 w-4 rounded-full border hairline"
                      style={{ background: c, marginLeft: i > 0 ? -6 : 0 }}
                    />
                  ))}
                </span>
                {pick(locale, L[p.key])}
              </button>
            ))}
          </div>
        </div>

        <Field label={pick(locale, L.kind)}>
          <Tabs
            options={[
              { id: "linear", label: pick(locale, L.linear) },
              { id: "radial", label: pick(locale, L.radial) },
              { id: "conic", label: pick(locale, L.conic) },
            ]}
            value={kind}
            onChange={(id) => setKind(id as GradientKind)}
          />
        </Field>

        {kind === "radial" ? (
          <Field label={pick(locale, L.shape)}>
            <select
              className="field sm:w-56"
              value={shape}
              onChange={(e) => setShape(e.target.value as RadialShape)}
              aria-label={pick(locale, L.shape)}
            >
              <option value="circle">{pick(locale, L.circle)}</option>
              <option value="ellipse">{pick(locale, L.ellipse)}</option>
            </select>
          </Field>
        ) : (
          <Field label={`${angleLabel}: ${angle}°`}>
            <input
              type="range"
              min={0}
              max={359}
              value={angle}
              onChange={(e) => setAngle(+e.target.value)}
              className="w-full"
              aria-label={angleLabel}
            />
          </Field>
        )}

        {notice && <Warn>{notice}</Warn>}

        <Field label={pick(locale, L.preview)}>
          <div
            className="h-40 w-full rounded-xl border hairline"
            style={gradient ? { backgroundImage: gradient } : undefined}
            role="img"
            aria-label={gradient ?? pick(locale, L.invalid)}
          />
        </Field>

        {gradient ? (
          <Field label={pick(locale, L.output)}>
            <pre className="overflow-x-auto rounded-xl bg-[var(--color-surface)] px-3.5 py-3 text-[13px] leading-5">{block}</pre>
            <div className="mt-2">
              <CopyButton value={block} label={t.common.copy} />
            </div>
          </Field>
        ) : (
          <Warn>{pick(locale, L.invalid)}</Warn>
        )}

        <Note>{pick(locale, L.hint)}</Note>
      </div>
    </ToolPanel>
  );
}
