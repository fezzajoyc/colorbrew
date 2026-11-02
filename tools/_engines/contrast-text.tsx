"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { CopyButton } from "@/components/client-ui";
import { ToolPanel } from "@/components/ui";
import type { Locale } from "@/lib/site";
import { bestTextColorOn, findTextShade, mixHex } from "../_lib/color-extra";
import { contrastRatio, wcagBadges } from "../_lib/contrast";
import { Field, Note, Tabs, Warn, pick } from "./ui";

/**
 * WCAG 文本色引擎:给定背景,给出白端/黑端各 WCAG 等级恰好达标的文本色,
 * 外加自定义候选色的对比度判定。搜索数学在 _lib/color-extra.ts(纯,已测)。
 */

type Level = "3" | "4.5" | "7";
const LEVELS: { id: Level; ratio: number }[] = [
  { id: "3", ratio: 3 },
  { id: "4.5", ratio: 4.5 },
  { id: "7", ratio: 7 },
];

const L: Record<string, Record<string, string>> = {
  bg: { en: "Background color", zh: "背景颜色", ja: "背景色", es: "Color de fondo", pt: "Cor de fundo" },
  target: { en: "WCAG target", zh: "WCAG 目标", ja: "WCAG 目標", es: "Objetivo WCAG", pt: "Alvo WCAG" },
  best: { en: "Best simple pick", zh: "黑白直选", ja: "最適な黒/白", es: "Mejor opción simple", pt: "Melhor escolha simples" },
  fromWhite: { en: "Lightest passing", zh: "最浅达标", ja: "合格する最も明るい色", es: "El más claro que pasa", pt: "O mais claro que passa" },
  fromBlack: { en: "Darkest passing", zh: "最深达标", ja: "合格する最も暗い色", es: "El más oscuro que pasa", pt: "O mais escuro que passa" },
  custom: { en: "Check a custom text color", zh: "检查自定义文字颜色", ja: "カスタム文字色をチェック", es: "Comprobar un color de texto personalizado", pt: "Verificar uma cor de texto personalizada" },
  sample: { en: "Preview", zh: "预览", ja: "プレビュー", es: "Vista previa", pt: "Pré-visualização" },
  sampleText: {
    en: "Design reads best when text passes contrast.",
    zh: "文字达标时,设计才真正耐读。",
    ja: "コントラストを満たす文字こそ、読みやすいデザインです。",
    es: "El diseño se lee mejor cuando el texto pasa el contraste.",
    pt: "O design lê-se melhor quando o texto passa no contraste.",
  },
  notReachable: {
    en: "Not reachable: even pure white/black never hits this ratio on this background.",
    zh: "不可达:纯白/纯黑在该背景上都达不到这个对比度。",
    ja: "到達不能:この背景では純白・純黒でもこの比率に届きません。",
    es: "Inalcanzable: ni el blanco ni el negro puros alcanzan esta proporción sobre este fondo.",
    pt: "Inalcançável: nem o branco nem o preto puros atingem essa proporção neste fundo.",
  },
  invalid: {
    en: "Enter a valid background color, like #7C3AED or hsl(262, 83%, 58%).",
    zh: "请输入有效的背景颜色,如 #7C3AED 或 hsl(262, 83%, 58%)。",
    ja: "有効な背景色を入力してください(#7C3AED など)。",
    es: "Introduce un color de fondo válido, como #7C3AED.",
    pt: "Insira uma cor de fundo válida, como #7C3AED.",
  },
  hint: {
    en: "“Passing” shades are the closest color to pure white (or black) that still clears the target — found by bisecting a white↔black mix, not eyeballed. Large text = ≥18 pt, or ≥14 pt bold.",
    zh: "“达标”色是仍满足目标的前提下最接近纯白(或纯黑)的颜色——由白↔黑混合二分求得,不是目测。大字 = ≥18pt,或 ≥14pt 加粗。",
    ja: "「合格」色は目標を満たす中で純白(または純黒)に最も近い色で、白↔黒の混合を二分探索して求めます。大きいテキスト = 18pt 以上、または 14pt 以上の太字。",
    es: "Los tonos «que pasan» son el color más cercano al blanco puro (o negro) que aún cumple el objetivo, hallado por bisección de una mezcla blanco↔negro. Texto grande = ≥18 pt o ≥14 pt en negrita.",
    pt: "Os tons «que passam» são a cor mais próxima do branco puro (ou preto) que ainda cumpre o alvo, obtida por bisseção de uma mistura branco↔preto. Texto grande = ≥18 pt ou ≥14 pt em negrito.",
  },
};

function ShadeRow({
  label,
  bg,
  target,
  from,
  locale,
}: {
  label: string;
  bg: string;
  target: number;
  from: "white" | "black";
  locale: Locale;
}) {
  const { t } = useI18n();
  const shade = useMemo(() => findTextShade(bg, target, from), [bg, target, from]);
  return (
    <div className="rounded-xl border hairline px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-[var(--color-sub)]">{label}</span>
        {shade ? (
          <code className="mono text-[13px] font-semibold">{shade.color}</code>
        ) : (
          <span className="text-[12.5px] text-[var(--color-bad)]">—</span>
        )}
      </div>
      {shade ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="mono text-[12.5px] text-[var(--color-sub)]">{shade.ratio.toFixed(2)}:1</span>
          <CopyButton value={shade.color} label={t.common.copy} />
        </div>
      ) : (
        <p className="mt-1 text-[12px] leading-4 text-[var(--color-bad)]">{pick(locale, L.notReachable)}</p>
      )}
      {shade && (
        <div
          className="mt-2 rounded-lg px-2.5 py-1.5 text-[13px]"
          style={{ background: bg.trim(), color: shade.color }}
        >
          Aa — {shade.color}
        </div>
      )}
    </div>
  );
}

export function ContrastTextEngine() {
  const { locale, t } = useI18n();
  const [bg, setBg] = useState("#F9FAFB");
  const [level, setLevel] = useState<Level>("4.5");
  const [custom, setCustom] = useState("#7C3AED");

  const target = Number(level);
  const bgOk = useMemo(() => Number.isFinite(contrastRatio(bg, "#ffffff")), [bg]);
  const best = useMemo(() => (bgOk ? bestTextColorOn(bg) : null), [bgOk, bg]);
  const customRatio = useMemo(() => contrastRatio(custom, bg), [custom, bg]);
  const customBadges = Number.isFinite(customRatio) ? wcagBadges(customRatio) : null;
  const customPreview = mixHex(custom, bg, 0) ?? custom; // 纯展示用原色

  return (
    <ToolPanel>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={pick(locale, L.bg)}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(bg.trim()) ? bg.trim().toLowerCase() : "#f9fafb"}
                onChange={(e) => setBg(e.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
                aria-label={pick(locale, L.bg)}
              />
              <input
                type="text"
                className="field mono"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                placeholder="#F9FAFB"
                spellCheck={false}
                aria-label={pick(locale, L.bg)}
              />
            </div>
          </Field>
          <Field label={pick(locale, L.target)}>
            <Tabs
              options={LEVELS.map((l) => ({ id: l.id, label: `${l.ratio}:1` }))}
              value={level}
              onChange={(id) => setLevel(id as Level)}
            />
          </Field>
        </div>

        {bgOk ? (
          <>
            {best && (
              <div className="rounded-xl border hairline px-3.5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, L.best)}</span>
                  <code className="mono text-[13px] font-semibold">{best.color}</code>
                  <span className="mono text-[13px] text-[var(--color-sub)]">{best.ratio.toFixed(2)}:1</span>
                  <CopyButton value={best.color} label={t.common.copy} />
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <ShadeRow label={`${pick(locale, L.fromWhite)} ≥${target}:1`} bg={bg} target={target} from="white" locale={locale} />
              <ShadeRow label={`${pick(locale, L.fromBlack)} ≥${target}:1`} bg={bg} target={target} from="black" locale={locale} />
            </div>

            <Field label={pick(locale, L.custom)}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(custom.trim()) ? custom.trim().toLowerCase() : "#7c3aed"}
                  onChange={(e) => setCustom(e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
                  aria-label={pick(locale, L.custom)}
                />
                <input
                  type="text"
                  className="field mono w-40"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  spellCheck={false}
                  aria-label={pick(locale, L.custom)}
                />
                {customBadges ? (
                  <span className="mono text-[13px] font-semibold" aria-live="polite">
                    {customRatio.toFixed(2)}:1{" "}
                    <span className={customBadges.aaNormal ? "text-[var(--color-good)]" : "text-[var(--color-bad)]"}>
                      AA {customBadges.aaNormal ? "✓" : "✕"} · AAA {customBadges.aaaNormal ? "✓" : "✕"}
                    </span>
                  </span>
                ) : (
                  <span className="text-[12.5px] text-[var(--color-bad)]">—</span>
                )}
                <CopyButton value={custom} label={t.common.copy} />
              </div>
              <div
                className="mt-2 rounded-xl border hairline px-4 py-3"
                style={{ background: bg.trim(), color: customPreview }}
              >
                <p className="text-[15px] leading-6">{pick(locale, L.sampleText)}</p>
              </div>
            </Field>
          </>
        ) : (
          <Warn>{pick(locale, L.invalid)}</Warn>
        )}

        <Note>{pick(locale, L.hint)}</Note>
      </div>
    </ToolPanel>
  );
}
