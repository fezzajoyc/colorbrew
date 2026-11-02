import { z } from "zod";
import { gradientCss, hslToHex, type GradientKind, type RadialShape } from "../tools/_lib/gradient";
import { contrastRatio, wcagBadges } from "../tools/_lib/contrast";
import {
  CB_TYPES,
  bestTextColorOn,
  detectColorFormat,
  findTextShade,
  generatePalette,
  hexToOklch,
  hexToRgb,
  hslTextToHsl,
  oklchTextToOklch,
  oklchToHex,
  paletteToCssVariables,
  rgbToHex,
  rgbToHsl,
  rgbTextToRgb,
  simulateColorBlindness,
  type ColorBlindnessType,
  type Harmony,
} from "../tools/_lib/color-extra";

/**
 * ColorBrew MCP 工具注册表:把 tools/_lib 的颜色纯函数暴露为 AI 可执行工具。
 * 站上的同名工具在浏览器里跑(交互式),这里跑同一份经过测试的实现——
 * 人和 AI 用同一套逻辑,而不是两套各写各的。
 */

const round2 = (n: number) => Math.round(n * 100) / 100;
const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const err = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const });

/** 任意可解析输入(HEX/RGB/HSL/OKLCH 文本)→ 规范 hex;失败 null。 */
function toHex(input: string): string | null {
  const kind = detectColorFormat(input);
  if (!kind) return null;
  if (kind === "hex") {
    const rgb = hexToRgb(input);
    return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : null;
  }
  if (kind === "rgb") {
    const rgb = rgbTextToRgb(input);
    return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : null;
  }
  if (kind === "hsl") {
    const hsl = hslTextToHsl(input);
    return hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : null;
  }
  const ok = oklchTextToOklch(input);
  return ok ? oklchToHex(ok.l, ok.c, ok.h) : null;
}

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  run: (args: any) => { content: { type: "text"; text: string }[]; isError?: boolean };
};

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "gradient_css",
    title: "CSS gradient builder",
    description:
      "Build a standard CSS gradient string from 2–5 color stops. Kind: linear (angle deg, 0 = up, clockwise), radial (shape circle/ellipse), conic (from-angle). Unpositioned stops are interpolated per the CSS spec; returns null-equivalent error for invalid input.",
    schema: {
      stops: z
        .array(
          z.object({
            color: z.string().describe("stop color, any of #RGB/#RRGGBB/rgb()/hsl()/oklch() text"),
            position: z.number().min(0).max(100).optional().describe("0–100; omit to interpolate per CSS rules"),
          }),
        )
        .min(2)
        .max(5),
      kind: z.enum(["linear", "radial", "conic"]).default("linear"),
      angle: z.number().describe("angle in degrees for linear/conic (any number; normalized to 0–359)"),
      shape: z.enum(["circle", "ellipse"]).default("circle").describe("radial shape only"),
    },
    run: (a) => {
      const hexStops: { color: string; position?: number }[] = [];
      for (const s of a.stops) {
        const hex = toHex(s.color);
        if (!hex) return err(`invalid stop color: ${s.color}`);
        hexStops.push({ color: hex, position: s.position });
      }
      const css = gradientCss(hexStops, a.kind as GradientKind, a.angle, a.shape as RadialShape);
      if (!css) return err("invalid gradient input: need 2+ stops with finite positions and angle");
      return text(css);
    },
  },
  {
    name: "contrast_ratio",
    title: "WCAG contrast ratio",
    description:
      "Contrast ratio between two colors (#RGB/#RRGGBB/rgb()/rgba()) with WCAG AA/AAA pass-fail for normal (≥4.5 AA, ≥7 AAA) and large text (≥3 AA, ≥4.5 AAA). Alpha colors are flattened onto white per CSS compositing.",
    schema: { foreground: z.string(), background: z.string() },
    run: (a) => {
      const ratio = contrastRatio(a.foreground, a.background);
      if (!Number.isFinite(ratio)) return err(`invalid colors: ${a.foreground} / ${a.background}`);
      return json({ ratio: round2(ratio), ...wcagBadges(ratio) });
    },
  },
  {
    name: "convert_color",
    title: "Color format converter",
    description:
      "Convert one color between HEX, RGB, HSL and OKLCH (Ottosson OKLab matrices, same as CSS Color 4). Accepts #RGB/#RRGGBB, rgb()/rgba(), hsl()/hsla() and oklch() text; alpha colors are rejected rather than flattened.",
    schema: { color: z.string().describe("color text in any supported format") },
    run: (a) => {
      const kind = detectColorFormat(a.color);
      if (!kind) return err(`unrecognized color format: ${a.color}`);
      const hex = toHex(a.color);
      if (!hex) return err(`invalid color: ${a.color}`);
      const rgb = hexToRgb(hex)!;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const ok = hexToOklch(hex)!;
      return json({
        input: a.color,
        detected: kind,
        hex,
        rgb: { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) },
        hsl: { h: round2(hsl.h), s: round2(hsl.s), l: round2(hsl.l) },
        oklch: { l: Math.round(ok.l * 1000) / 1000, c: Math.round(ok.c * 10000) / 10000, h: round2(ok.h) },
      });
    },
  },
  {
    name: "generate_palette",
    title: "Color palette from harmony",
    description:
      "Generate a 5-color palette from a base color using color-wheel harmony: complementary, analogous, triadic, split-complementary, tetradic or monochromatic. Also returns the palette as CSS custom properties. Gray bases stay gray (hue rotation needs saturation).",
    schema: {
      base_color: z.string().describe("base color, any supported format text"),
      harmony: z.enum(["complementary", "analogous", "triadic", "split-complementary", "tetradic", "monochromatic"]).default("complementary"),
    },
    run: (a) => {
      const hex = toHex(a.base_color);
      if (!hex) return err(`invalid base color: ${a.base_color}`);
      const colors = generatePalette(hex, a.harmony as Harmony);
      if (!colors) return err(`could not build palette from: ${a.base_color}`);
      return json({ harmony: a.harmony, colors, css_variables: paletteToCssVariables(colors) });
    },
  },
  {
    name: "simulate_color_blindness",
    title: "Color blindness simulation",
    description:
      "Simulate dichromat color vision (Viénot–Brettel–Mollon 1999 model, linear RGB) on a color: protanopia (red-blind), deuteranopia (green-blind), tritanopia (blue-blind). Omit type to get all three. Estimates perception — not a diagnosis; grays are unchanged by design.",
    schema: {
      color: z.string().describe("color, any supported format text"),
      type: z.enum(["protanopia", "deuteranopia", "tritanopia"]).optional(),
    },
    run: (a) => {
      const hex = toHex(a.color);
      if (!hex) return err(`invalid color: ${a.color}`);
      const types = a.type ? [a.type as ColorBlindnessType] : CB_TYPES;
      const simulated: Record<string, string> = {};
      for (const type of types) {
        const out = simulateColorBlindness(hex, type);
        if (!out) return err(`simulation failed for ${hex} / ${type}`);
        simulated[type] = out;
      }
      return json({ color: hex, ...simulated });
    },
  },
  {
    name: "contrast_text",
    title: "WCAG text color finder",
    description:
      "Find text colors that pass a WCAG target (3 = large-text AA, 4.5 = normal AA, 7 = AAA) on a background: the closest passing color to pure white, the closest to pure black, and the better of plain white/black. Unreachable levels are reported honestly.",
    schema: {
      background: z.string().describe("background color, any supported format text"),
      target: z.number().min(1).max(21).default(4.5).describe("contrast target, typically 3, 4.5 or 7"),
    },
    run: (a) => {
      const bg = toHex(a.background);
      if (!bg) return err(`invalid background color: ${a.background}`);
      const white = findTextShade(bg, a.target, "white");
      const black = findTextShade(bg, a.target, "black");
      const best = bestTextColorOn(bg);
      const r = (t: number) => round2(t);
      return json({
        background: bg,
        target: a.target,
        lightest_passing: white ? { color: white.color, ratio: r(white.ratio) } : "unreachable",
        darkest_passing: black ? { color: black.color, ratio: r(black.ratio) } : "unreachable",
        best_simple_pick: best ? { color: best.color, ratio: r(best.ratio) } : null,
      });
    },
  },
];

/** 供文档/llms.txt 描述的只读元数据。 */
export const MCP_TOOL_NAMES = MCP_TOOLS.map((t) => t.name);
