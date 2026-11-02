"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { DropZone, downloadBlob } from "@/components/client-ui";
import { CB_TYPES, simulateColorBlindness, simulateRgbaPixels, type ColorBlindnessType } from "../_lib/color-extra";
import { Field, Note, Tabs, Warn, pick } from "./ui";

/**
 * 色盲模拟引擎:纯色样张 + 图片上传(canvas 像素级模拟),三种二色视类型,
 * 结果可下载 PNG。矩阵数学在 _lib/color-extra.ts(纯,已测);引擎只做像素搬运。
 */

const L: Record<string, Record<string, string>> = {
  modeColor: { en: "Solid color", zh: "纯色样张", ja: "単色サンプル", es: "Color sólido", pt: "Cor sólida" },
  modeImage: { en: "Image", zh: "图片", ja: "画像", es: "Imagen", pt: "Imagem" },
  color: { en: "Color", zh: "颜色", ja: "色", es: "Color", pt: "Cor" },
  original: { en: "Original", zh: "原图", ja: "元画像", es: "Original", pt: "Original" },
  protanopia: { en: "Protanopia", zh: "红色盲(protanopia)", ja: "1 型色覚(protanopia)", es: "Protanopía", pt: "Protanopia" },
  deuteranopia: { en: "Deuteranopia", zh: "绿色盲(deuteranopia)", ja: "1 型色覚(deuteranopia)", es: "Deuteranopía", pt: "Deuteranopia" },
  tritanopia: { en: "Tritanopia", zh: "蓝色盲(tritanopia)", ja: "3 型色覚(tritanopia)", es: "Tritanopía", pt: "Tritanopia" },
  download: { en: "Download PNG", zh: "下载 PNG", ja: "PNG をダウンロード", es: "Descargar PNG", pt: "Baixar PNG" },
  invalidColor: {
    en: "Enter a valid hex color, like #7C3AED.",
    zh: "请输入有效的十六进制颜色,如 #7C3AED。",
    ja: "有効な 16 進カラーを入力してください(#7C3AED など)。",
    es: "Introduce un color hexadecimal válido, como #7C3AED.",
    pt: "Insira uma cor hexadecimal válida, como #7C3AED.",
  },
  notImage: {
    en: "That file is not an image the browser can decode. Try a PNG or JPG.",
    zh: "该文件不是浏览器能解码的图片,请换 PNG 或 JPG。",
    ja: "そのファイルはブラウザーがデコードできる画像ではありません。PNG や JPG をお試しください。",
    es: "Ese archivo no es una imagen que el navegador pueda decodificar. Prueba un PNG o JPG.",
    pt: "Esse arquivo não é uma imagem que o navegador consiga decodificar. Tente um PNG ou JPG.",
  },
  hint: {
    en: "Simulation uses the Viénot–Brettel–Mollon (1999) dichromat model applied in linear RGB — the standard reference for red/green/blue-blind vision. It is an approximation of perception, not a diagnosis; grayscale images come back unchanged.",
    zh: "模拟使用 Viénot–Brettel–Mollon(1999)二色视模型,在线性 RGB 上运算——红/绿/蓝色觉障碍研究的标准参考。它是对感知的近似,不构成诊断;灰度图模拟后不变。",
    ja: "シミュレーションは Viénot–Brettel–Mollon(1999)の 2 色型モデルをリニア RGB に適用したもので、色覚研究の標準的な参考実装です。知覚の近似であり診断ではありません。グレースケール画像は変化しません。",
    es: "La simulación usa el modelo de dicromatismo de Viénot–Brettel–Mollon (1999) aplicado en RGB lineal, la referencia estándar para visión ciego al rojo/verde/azul. Es una aproximación de la percepción, no un diagnóstico; las imágenes en escala de grises salen iguales.",
    pt: "A simulação usa o modelo de dicromatismo de Viénot–Brettel–Mollon (1999) aplicado em RGB linear — a referência padrão para visão cega ao vermelho/verde/azul. É uma aproximação da percepção, não um diagnóstico; imagens em tons de cinza saem inalteradas.",
  },
};

const MAX_EDGE = 1400;

export function ColorBlindnessSimulatorEngine() {
  const { locale } = useI18n();
  const [mode, setMode] = useState<"color" | "image">("color");
  const [color, setColor] = useState("#7C3AED");
  const [imgError, setImgError] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState("");
  const originalRef = useRef<HTMLCanvasElement>(null);
  const variantRefs = useRef<Record<ColorBlindnessType, HTMLCanvasElement | null>>({
    protanopia: null,
    deuteranopia: null,
    tritanopia: null,
  });

  const valid6 = /^#[0-9a-f]{6}$/i.test(color.trim());

  const processImage = useCallback(
    (img: HTMLImageElement) => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));

      // 原图
      const oc = originalRef.current;
      if (!oc) return;
      oc.width = w;
      oc.height = h;
      const octx = oc.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, w, h);

      // 三种模拟:同一份像素克隆后过矩阵
      const src = octx.getImageData(0, 0, w, h);
      for (const type of CB_TYPES) {
        const canvas = variantRefs.current[type];
        if (!canvas) continue;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;
        const data = new ImageData(new Uint8ClampedArray(src.data), w, h);
        simulateRgbaPixels(data.data, type);
        ctx.putImageData(data, 0, 0);
      }
      setHasImage(true);
    },
    [],
  );

  const onFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImgError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      processImage(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setHasImage(false);
      setImgError(pick(locale, L.notImage));
    };
    img.src = url;
  };

  const download = (type: ColorBlindnessType | "original") => {
    const canvas = type === "original" ? originalRef.current : variantRefs.current[type];
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${fileName || "colorbrew"}-${type}.png`);
    }, "image/png");
  };

  const downloadColor = (hex: string, type: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 512, 512);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `colorbrew-${type}.png`);
    }, "image/png");
  };

  return (
    <ToolPanel>
      <div className="space-y-4">
        <Tabs
          options={[
            { id: "color", label: pick(locale, L.modeColor) },
            { id: "image", label: pick(locale, L.modeImage) },
          ]}
          value={mode}
          onChange={(id) => setMode(id as "color" | "image")}
        />

        {mode === "color" ? (
          <>
            <Field label={pick(locale, L.color)}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={valid6 ? color.trim().toLowerCase() : "#7c3aed"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border hairline bg-[var(--color-card)]"
                  aria-label={pick(locale, L.color)}
                />
                <input
                  type="text"
                  className="field mono"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#7C3AED"
                  spellCheck={false}
                  aria-label={pick(locale, L.color)}
                />
              </div>
            </Field>

            {valid6 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["original", color.trim()],
                    ...CB_TYPES.map((type) => [type, simulateColorBlindness(color.trim(), type) ?? ""] as const),
                  ] as const
                ).map(([key, hex]) => (
                  <div key={key} className="overflow-hidden rounded-xl border hairline">
                    <div className="h-24 w-full" style={{ background: hex }} role="img" aria-label={`${key} ${hex}`} />
                    <div className="space-y-1.5 bg-[var(--color-card)] px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[var(--color-sub)]">{pick(locale, L[key])}</span>
                        <code className="mono text-[11px]">{hex}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadColor(hex, key)}
                        className="rounded-full border hairline px-2.5 py-1 text-[11.5px] font-medium hover:bg-[var(--color-surface)]"
                      >
                        {pick(locale, L.download)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Warn>{pick(locale, L.invalidColor)}</Warn>
            )}
          </>
        ) : (
          <>
            <DropZone onFiles={onFiles} accept="image/*" multiple={false} />
            {imgError && <Warn>{imgError}</Warn>}
            {hasImage && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(["original", ...CB_TYPES] as const).map((key) => (
                  <div key={key} className="overflow-hidden rounded-xl border hairline">
                    <canvas
                      ref={key === "original" ? originalRef : (el) => {
                        variantRefs.current[key as ColorBlindnessType] = el;
                      }}
                      className="block h-auto w-full bg-[var(--color-surface)]"
                      aria-label={pick(locale, L[key])}
                    />
                    <div className="space-y-1.5 bg-[var(--color-card)] px-3 py-2">
                      <span className="text-[12px] font-semibold text-[var(--color-sub)]">{pick(locale, L[key])}</span>
                      <button
                        type="button"
                        onClick={() => download(key)}
                        className="block rounded-full border hairline px-2.5 py-1 text-[11.5px] font-medium hover:bg-[var(--color-surface)]"
                      >
                        {pick(locale, L.download)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Note>{pick(locale, L.hint)}</Note>
      </div>
    </ToolPanel>
  );
}
