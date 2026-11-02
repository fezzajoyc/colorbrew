"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { CopyButton } from "@/components/client-ui";
import { ToolPanel } from "@/components/ui";
import { HARMONIES, generatePalette, paletteToCssVariables, type Harmony } from "../_lib/color-extra";
import { Field, Note, Tabs, Warn, pick } from "./ui";

/**
 * 调色板引擎:基色 + 6 种色轮和声 → 5 色;一键复制 CSS 变量或逐色复制。
 * 和声数学在 _lib/color-extra.ts(纯,已测);色相旋转复用 _lib/gradient.ts。
 */

const L: Record<string, Record<string, string>> = {
  base: { en: "Base color", zh: "基色", ja: "ベースカラー", es: "Color base", pt: "Cor base" },
  harmony: { en: "Harmony", zh: "和声", ja: "ハーモニー", es: "Armonía", pt: "Harmonia" },
  complementary: { en: "Complementary", zh: "互补", ja: "補色", es: "Complementaria", pt: "Complementar" },
  analogous: { en: "Analogous", zh: "邻近", ja: "類似色", es: "Análoga", pt: "Análoga" },
  triadic: { en: "Triadic", zh: "三色", ja: "トリアッド", es: "Tríada", pt: "Tríade" },
  "split-complementary": { en: "Split complementary", zh: "分裂互补", ja: "スプリット補色", es: "Complementaria dividida", pt: "Complementar dividida" },
  tetradic: { en: "Tetradic", zh: "四色", ja: "テトラッド", es: "Tétrada", pt: "Tétrade" },
  monochromatic: { en: "Monochromatic", zh: "单色", ja: "モノクロマティック", es: "Monocromática", pt: "Monocromática" },
  swatches: { en: "Palette", zh: "调色板", ja: "パレット", es: "Paleta", pt: "Paleta" },
  cssVars: { en: "CSS variables", zh: "CSS 变量", ja: "CSS 変数", es: "Variables CSS", pt: "Variáveis CSS" },
  copyAll: { en: "Copy as CSS variables", zh: "复制为 CSS 变量", ja: "CSS 変数としてコピー", es: "Copiar como variables CSS", pt: "Copiar como variáveis CSS" },
  invalid: {
    en: "Enter a valid base color, like #7C3AED or hsl(262, 83%, 58%).",
    zh: "请输入有效的基色,如 #7C3AED 或 hsl(262, 83%, 58%)。",
    ja: "有効なベースカラーを入力してください(#7C3AED や hsl(262, 83%, 58%) など)。",
    es: "Introduce un color base válido, como #7C3AED o hsl(262, 83%, 58%).",
    pt: "Insira uma cor base válida, como #7C3AED ou hsl(262, 83%, 58%).",
  },
  hint: {
    en: "Each swatch is the base hue rotated on the color wheel; extra rounds lighten by +18 so all five swatches differ. Gray bases stay gray — hue has no effect on zero saturation.",
    zh: "每个色块都是基色在色轮上的旋转;色相不足 5 个时按轮次提亮 +18,保证五格不同。灰色基色仍是灰阶——饱和度为零时色相不起作用。",
    ja: "各スウォッチはベースの色相をカラーホイール上で回転させたものです。色相が 5 個未満のハーモニーは 1 周ごとに +18 明るくして 5 色を確保します。グレーのベースはグレーのまま——彩度 0 では色相が効きません。",
    es: "Cada muestra es el tono base rotado en el círculo cromático; las armonías con menos de cinco tonos se aclaran +18 por vuelta para que las cinco difieran. Una base gris sigue gris: el tono no afecta a la saturación cero.",
    pt: "Cada amostra é o matiz base rotacionado no círculo cromático; harmonias com menos de cinco matizes clareiam +18 por volta para que as cinco difiram. Base cinza continua cinza — o matiz não afeta saturação zero.",
  },
};

export function PaletteGeneratorEngine() {
  const { locale } = useI18n();
  const [base, setBase] = useState("#7C3AED");
  const [harmony, setHarmony] = useState<Harmony>("complementary");

  const palette = useMemo(() => generatePalette(base, harmony), [base, harmony]);
  const cssVars = palette ? paletteToCssVariables(palette) : "";

  const valid6 = /^#[0-9a-f]{6}$/i.test(base.trim());

  return (
    <ToolPanel>
      <div className="space-y-4">
        <Field label={pick(locale, L.base)}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={valid6 ? base.trim().toLowerCase() : "#7c3aed"}
              onChange={(e) => setBase(e.target.value)}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
              aria-label={pick(locale, L.base)}
            />
            <input
              type="text"
              className="field mono"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              placeholder="#7C3AED"
              spellCheck={false}
              aria-label={pick(locale, L.base)}
            />
          </div>
        </Field>

        <Field label={pick(locale, L.harmony)}>
          <Tabs
            options={HARMONIES.map((h) => ({ id: h, label: pick(locale, L[h]) }))}
            value={harmony}
            onChange={(id) => setHarmony(id as Harmony)}
          />
        </Field>

        {palette ? (
          <>
            <Field label={pick(locale, L.swatches)}>
              <div className="grid grid-cols-5 overflow-hidden rounded-xl border hairline">
                {palette.map((c, i) => (
                  <div key={`${c}-${i}`} className="flex h-28 flex-col justify-end sm:h-36">
                    <div className="flex-1" style={{ background: c }} aria-hidden />
                    <div className="flex items-center justify-between gap-1 bg-[var(--color-card)] px-1.5 py-1.5">
                      <code className="mono text-[10.5px] leading-tight sm:text-[11.5px]">{c}</code>
                      <CopyButton
                        value={c}
                        label=""
                        className="!px-2 !py-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            <Field label={pick(locale, L.cssVars)}>
              <pre className="overflow-x-auto rounded-xl bg-[var(--color-surface)] px-3.5 py-3 text-[13px] leading-5">{cssVars}</pre>
              <div className="mt-2">
                <CopyButton value={cssVars} label={pick(locale, L.copyAll)} />
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
