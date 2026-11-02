"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { contrastRatio, wcagBadges } from "../_lib/contrast";
import { Field, Note, Warn, pick } from "./ui";

/**
 * WCAG 对比度检查引擎:前景/背景两色 → 比率 + AA/AAA 判定 + 样张预览。
 * 数学全在 _lib/contrast.ts(纯,已测);引擎只做输入与呈现。
 */

const DEFAULT_FG = "#1F2937";
const DEFAULT_BG = "#F9FAFB";

const L: Record<string, Record<string, string>> = {
  fg: { en: "Text color", zh: "文字颜色", ja: "文字色", es: "Color del texto", pt: "Cor do texto" },
  bg: { en: "Background", zh: "背景颜色", ja: "背景色", es: "Fondo", pt: "Fundo" },
  ratio: { en: "Contrast ratio", zh: "对比度", ja: "コントラスト比", es: "Relación de contraste", pt: "Razão de contraste" },
  aaNormal: { en: "AA normal text", zh: "AA 正文", ja: "AA 標準テキスト", es: "AA texto normal", pt: "AA texto normal" },
  aaaNormal: { en: "AAA normal text", zh: "AAA 正文", ja: "AAA 標準テキスト", es: "AAA texto normal", pt: "AAA texto normal" },
  aaLarge: { en: "AA large text", zh: "AA 大字", ja: "AA 大きいテキスト", es: "AA texto grande", pt: "AA texto grande" },
  aaaLarge: { en: "AAA large text", zh: "AAA 大字", ja: "AAA 大きいテキスト", es: "AAA texto grande", pt: "AAA texto grande" },
  pass: { en: "Pass", zh: "达标", ja: "合格", es: "Pasa", pt: "Passa" },
  fail: { en: "Fail", zh: "不达标", ja: "不合格", es: "No pasa", pt: "Não passa" },
  sample: { en: "Sample text preview", zh: "样张预览", ja: "サンプルテキスト", es: "Vista previa de texto", pt: "Pré-visualização de texto" },
  sampleBody: {
    en: "The quick brown fox jumps over the lazy dog.",
    zh: "敏捷的棕色狐狸跳过了懒惰的狗。",
    ja: "素早い茶色のキツネは怠惰な犬を飛び越える。",
    es: "El veloz zorro marrón salta sobre el perro perezoso.",
    pt: "A rápida raposa marrom salta sobre o cão preguiçoso.",
  },
  invalid: {
    en: "Enter two valid colors (#RGB, #RRGGBB, rgb() or rgba()).",
    zh: "请输入两个有效颜色(#RGB、#RRGGBB、rgb() 或 rgba())。",
    ja: "有効な色を 2 つ入力してください(#RGB、#RRGGBB、rgb()、rgba())。",
    es: "Introduce dos colores válidos (#RGB, #RRGGBB, rgb() o rgba()).",
    pt: "Insira duas cores válidas (#RGB, #RRGGBB, rgb() ou rgba()).",
  },
  hint: {
    en: "WCAG 2.x thresholds: normal text needs 4.5:1 (AA) and 7:1 (AAA); large text (≥18 pt or ≥14 pt bold) needs 3:1 and 4.5:1. Colors with alpha are flattened onto white, matching how CSS composites them.",
    zh: "WCAG 2.x 阈值:正文 4.5:1(AA)、7:1(AAA);大字(≥18pt 或 ≥14pt 加粗)3:1、4.5:1。带透明度的颜色会按 CSS 规则压平到白底。",
    ja: "WCAG 2.x のしきい値:通常テキストは 4.5:1(AA)と 7:1(AAA)、大きいテキスト(18pt 以上または 14pt 以上の太字)は 3:1 と 4.5:1。アルファ付きの色は CSS と同じく白に合成されます。",
    es: "Umbrales WCAG 2.x: texto normal 4,5:1 (AA) y 7:1 (AAA); texto grande (≥18 pt o ≥14 pt en negrita) 3:1 y 4,5:1. Los colores con alfa se aplanan sobre blanco, como los compone CSS.",
    pt: "Limiares WCAG 2.x: texto normal 4,5:1 (AA) e 7:1 (AAA); texto grande (≥18 pt ou ≥14 pt em negrito) 3:1 e 4,5:1. Cores com alfa são achatadas sobre o branco, como o CSS as compõe.",
  },
};

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = /^#[0-9a-f]{6}$/i.test(value.trim());
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={valid ? value.trim().toLowerCase() : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
        aria-label={label}
      />
      <input
        type="text"
        className="field mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label={label}
      />
    </div>
  );
}

export function ContrastCheckerEngine() {
  const { locale } = useI18n();
  const [fg, setFg] = useState(DEFAULT_FG);
  const [bg, setBg] = useState(DEFAULT_BG);

  const result = useMemo(() => {
    const ratio = contrastRatio(fg, bg);
    return Number.isFinite(ratio) ? { ratio, badges: wcagBadges(ratio) } : null;
  }, [fg, bg]);

  return (
    <ToolPanel>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={pick(locale, L.fg)}>
            <ColorRow label={pick(locale, L.fg)} value={fg} onChange={setFg} />
          </Field>
          <Field label={pick(locale, L.bg)}>
            <ColorRow label={pick(locale, L.bg)} value={bg} onChange={setBg} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFg(bg);
              setBg(fg);
            }}
            className="rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
          >
            ⇄ {locale === "zh" ? "交换" : locale === "ja" ? "入れ替え" : locale === "es" ? "Intercambiar" : locale === "pt" ? "Trocar" : "Swap"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFg(DEFAULT_FG);
              setBg(DEFAULT_BG);
            }}
            className="rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-sub)] transition-colors hover:bg-[var(--color-surface)]"
          >
            {locale === "zh" ? "重置" : locale === "ja" ? "リセット" : locale === "es" ? "Restablecer" : locale === "pt" ? "Redefinir" : "Reset"}
          </button>
        </div>

        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border hairline px-4 py-3">
                <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, L.ratio)}</div>
                <div className="mono mt-1 text-3xl font-semibold" aria-live="polite">
                  {result.ratio.toFixed(2)}:1
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["aaNormal", 4.5],
                    ["aaaNormal", 7],
                    ["aaLarge", 3],
                    ["aaaLarge", 4.5],
                  ] as const
                ).map(([key, threshold]) => {
                  const ok = result.badges[key];
                  return (
                    <div key={key} className="rounded-xl border hairline px-3 py-2">
                      <div className="text-[12px] font-medium text-[var(--color-sub)]">
                        {pick(locale, L[key])} <span className="mono">≥{threshold}</span>
                      </div>
                      <div
                        className={`mt-0.5 text-[13.5px] font-semibold ${ok ? "text-[var(--color-good)]" : "text-[var(--color-bad)]"}`}
                      >
                        {ok ? `✓ ${pick(locale, L.pass)}` : `✕ ${pick(locale, L.fail)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Field label={pick(locale, L.sample)}>
              <div
                className="rounded-xl border hairline px-5 py-6"
                style={{ background: bg.trim() || "#ffffff", color: fg.trim() || "#000000" }}
              >
                <p className="text-[26px] font-bold leading-tight">Aa 18pt</p>
                <p className="mt-1 text-[15px] leading-6">{pick(locale, L.sampleBody)}</p>
                <p className="mt-1 text-[12px] leading-5 opacity-80">12px caption</p>
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
