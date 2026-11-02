"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { CopyButton } from "@/components/client-ui";
import { ToolPanel } from "@/components/ui";
import {
  detectColorFormat,
  hexToOklch,
  hexToRgb,
  hslTextToHsl,
  oklchTextToOklch,
  oklchToHex,
  rgbTextToRgb,
  rgbToHex,
  rgbToHsl,
  type ColorFormat,
} from "../_lib/color-extra";
import { hslToHex } from "../_lib/gradient";
import { Field, Note, Warn, pick } from "./ui";

/**
 * 颜色转换引擎:HEX / RGB / HSL / OKLCH 四行互改,改任意一行其余同步。
 * 解析与转换全在 _lib/color-extra.ts + _lib/gradient.ts;引擎只做草稿态管理。
 */

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];

/** 数字 → 定长小数字符串(去尾零)。 */
function trim(n: number, maxFrac: number): string {
  const s = n.toFixed(maxFrac);
  return s.replace(/\.?0+$/, "");
}

function formatValue(kind: ColorFormat, rgb: { r: number; g: number; b: number }): string {
  if (kind === "hex") return rgbToHex(rgb.r, rgb.g, rgb.b);
  if (kind === "rgb") return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (kind === "hsl") return `hsl(${trim(hsl.h, 1)}, ${trim(hsl.s, 1)}%, ${trim(hsl.l, 1)}%)`;
  const ok = hexToOklch(rgbToHex(rgb.r, rgb.g, rgb.b))!;
  return `oklch(${trim(ok.l, 3)} ${trim(ok.c, 4)} ${trim(ok.h, 2)})`;
}

function parseInput(kind: ColorFormat, text: string): { r: number; g: number; b: number } | null {
  if (kind === "hex") return hexToRgb(text);
  if (kind === "rgb") return rgbTextToRgb(text);
  if (kind === "hsl") {
    const hsl = hslTextToHsl(text);
    if (!hsl) return null;
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    return hexToRgb(hex);
  }
  const ok = oklchTextToOklch(text);
  if (!ok) return null;
  const hex = oklchToHex(ok.l, ok.c, ok.h);
  return hex ? hexToRgb(hex) : null;
}

const L: Record<string, Record<string, string>> = {
  input: { en: "Pick or paste a color", zh: "取色或粘贴颜色", ja: "色を抽出または貼り付け", es: "Elige o pega un color", pt: "Escolha ou cole uma cor" },
  detected: { en: "Detected", zh: "识别为", ja: "判定", es: "Detectado", pt: "Detectado" },
  formats: { en: "All formats", zh: "全部格式", ja: "すべての形式", es: "Todos los formatos", pt: "Todos os formatos" },
  invalid: {
    en: "Not a color we can read. Try #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) or oklch(0.541 0.247 293).",
    zh: "无法识别的颜色。试试 #7C3AED、rgb(124 58 237)、hsl(262, 83%, 58%) 或 oklch(0.541 0.247 293)。",
    ja: "読み取れない色です。#7C3AED、rgb(124 58 237)、hsl(262, 83%, 58%)、oklch(0.541 0.247 293) などを試してください。",
    es: "No es un color que podamos leer. Prueba #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) u oklch(0.541 0.247 293).",
    pt: "Não é uma cor que conseguimos ler. Tente #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) ou oklch(0.541 0.247 293).",
  },
  hint: {
    en: "Edit any row and the others stay in sync. Bare hex like 7C3AED is accepted; colors with alpha are rejected rather than silently flattened.",
    zh: "改任意一行,其余行实时同步。接受裸十六进制(如 7C3AED);带透明度的颜色会被拒绝,而不是静默压平。",
    ja: "どれか 1 行を編集すると他の行も同期します。7C3AED のような裸 HEX も扱えます。アルファ付きの色は黙って合成せず拒否します。",
    es: "Edita cualquier fila y las demás se sincronizan. Se acepta hex desnudo (p. ej. 7C3AED); los colores con alfa se rechazan en vez de aplanarse en silencio.",
    pt: "Edite qualquer linha e as outras ficam em sincronia. Hex sem # é aceito (ex.: 7C3AED); cores com alfa são rejeitadas em vez de achatadas em silêncio.",
  },
};

export function ColorConverterEngine() {
  const { locale, t } = useI18n();
  const [rgb, setRgb] = useState({ r: 124, g: 58, b: 237 }); // #7C3AED
  const [drafts, setDrafts] = useState<Partial<Record<ColorFormat, string>>>({});
  const [draftValid, setDraftValid] = useState(true);

  const edit = (kind: ColorFormat, text: string) => {
    const parsed = parseInput(kind, text);
    setDrafts({ [kind]: text }); // 保留本行草稿,其余行从规范色重新派生
    setDraftValid(parsed !== null || text.trim() === "");
    if (parsed) setRgb(parsed);
  };

  const value = (kind: ColorFormat): string => drafts[kind] ?? formatValue(kind, rgb);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const detected = useMemo(() => {
    const raw = FORMATS.map((f) => drafts[f]).find((s) => s !== undefined && s.trim() !== "");
    return raw ? detectColorFormat(raw) : null;
  }, [drafts]);

  return (
    <ToolPanel>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              const parsed = hexToRgb(e.target.value);
              if (parsed) {
                setRgb(parsed);
                setDrafts({});
                setDraftValid(true);
              }
            }}
            className="h-14 w-16 cursor-pointer rounded-xl border hairline bg-[var(--color-card)]"
            aria-label={pick(locale, L.input)}
          />
          {detected && (
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-[12.5px] font-medium text-[var(--color-sub)]">
              {pick(locale, L.detected)}: {detected}
            </span>
          )}
        </div>

        <Field label={pick(locale, L.formats)}>
          <div className="space-y-2">
            {FORMATS.map((kind) => {
              const invalid = drafts[kind] !== undefined && !draftValid;
              return (
                <div key={kind} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[12.5px] font-semibold uppercase text-[var(--color-sub)]">{kind}</span>
                  <input
                    type="text"
                    className={`field mono ${invalid ? "border-[var(--color-bad)]" : ""}`}
                    value={value(kind)}
                    onChange={(e) => edit(kind, e.target.value)}
                    spellCheck={false}
                    aria-label={`${kind}`}
                  />
                  <CopyButton value={value(kind)} label={t.common.copy} />
                </div>
              );
            })}
          </div>
        </Field>

        {!draftValid && <Warn>{pick(locale, L.invalid)}</Warn>}

        <div className="h-24 w-full rounded-xl border hairline" style={{ background: hex }} role="img" aria-label={hex} />

        <Note>{pick(locale, L.hint)}</Note>
      </div>
    </ToolPanel>
  );
}
