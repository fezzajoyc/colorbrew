/**
 * ColorBrew 扩展颜色纯函数,Node 可测。与 gradient.ts(HSL/渐变)、
 * contrast.ts(WCAG 对比度)互补:这里只依赖那两份实现,不重复造轮子。
 *
 * - 格式解析与转换:HEX ↔ RGB ↔ HSL ↔ OKLCH,格式探测;非法输入返回 null,绝不抛异常。
 * - OKLCH:Ottosson(2020)标准矩阵,sRGB → 线性 → OKLab → LCh;可逆(容差 ±1/255)。
 * - generatePalette:色轮和声(6 种),色相表 + 轮次提亮,5 色输出。
 * - 色盲模拟:Viénot et al. 1999 线性 RGB 矩阵(protanopia/deuteranopia/tritanopia);
 *   灰色逐型不变(矩阵每行和为 1)。
 * - WCAG 文本色搜索:从白/黑端向对侧二分搜索,返回恰好达标的最小调整色。
 */

import type { Hsl } from "./gradient";
import { hexToHsl, hslToHex } from "./gradient";
import { contrastRatio, type Rgb } from "./contrast";

/* ------------------------------------------------------------------ */
/* HEX ↔ RGB ↔ HSL 转换                                                */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * #rgb / #rrggbb / 裸 3或6 位十六进制 → 0–255 整数通道。
 * 本站不支持 CSS 颜色名,因此裸十六进制串(如 "cafe12")按 hex 解析——这是
 * 本工具的公开约定,FAQ 里写明。非法返回 null。
 */
export function hexToRgb(hex: string): Rgb | null {
  if (typeof hex !== "string") return null;
  const m = HEX_RE.exec(hex.trim());
  if (!m) return null;
  const s = m[1];
  if (s.length === 3) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

const clampByte = (n: number): number => (Number.isFinite(n) ? Math.min(255, Math.max(0, Math.round(n))) : 0);

/** 通道 → #rrggbb(小写);非有限值按 0 处理,超界截断——不抛异常。 */
export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => clampByte(n).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** RGB(0–255)→ HSL(h 0–360,s/l 0–100)。与 gradient.hexToHsl 同一套公式。 */
export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const cMax = Math.max(rn, gn, bn);
  const cMin = Math.min(rn, gn, bn);
  const d = cMax - cMin;
  const l = (cMax + cMin) / 2;
  let h = 0;
  if (d !== 0) {
    if (cMax === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (cMax === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

/* 文本解析:rgb() / hsl() —— 带逗号的 legacy 语法与空格现代语法都接受 */

const NUM = String.raw`(-?\d+(?:\.\d+)?%?)`;
const RGB_TEXT = new RegExp(String.raw`^rgba?\(\s*${NUM}\s*[,\s]\s*${NUM}\s*[,\s]\s*${NUM}(?:\s*[,\s]\s*${NUM}\s*)?\)$`, "i");
const HSL_TEXT = new RegExp(String.raw`^hsla?\(\s*${NUM}(?:deg)?\s*[,\s]\s*${NUM}\s*[,\s]\s*${NUM}(?:\s*[,\s]\s*${NUM}\s*)?\)$`, "i");

/** 通道记号 → 0–255:"50%" → 127.5,"120" → 120;超界截断。 */
function channelOf(token: string): number {
  const v = Number(token.replace(/%$/, ""));
  if (!Number.isFinite(v)) return 0;
  return token.endsWith("%") ? (v * 255) / 100 : v;
}

/**
 * "rgb(51, 102, 153)" / "rgb(51 102 153)" / 百分比 → RGB。
 * rgba 带 alpha:alpha < 1 视为非法(转换器只处理实色,不给静默压平),返回 null。
 */
export function rgbTextToRgb(text: string): Rgb | null {
  if (typeof text !== "string") return null;
  const m = RGB_TEXT.exec(text.trim());
  if (!m) return null;
  const alpha = m[4];
  if (alpha !== undefined) {
    const a = Number(alpha);
    if (!Number.isFinite(a) || a < 0 || a > 1) return null;
    if (a < 1) return null;
  }
  return {
    r: clampByte(channelOf(m[1])),
    g: clampByte(channelOf(m[2])),
    b: clampByte(channelOf(m[3])),
  };
}

/** h/s/l 记号 → 0–100:数字或百分比都接受("50%" 与 "50" 等价,均为 0–100 标度)。 */
function pctOf(token: string): number {
  const v = Number(token.replace(/%$/, ""));
  if (!Number.isFinite(v)) return 0;
  return v;
}

/**
 * "hsl(210, 50%, 40%)" / "hsl(210 50% 40%)" / "hsl(210deg 50% 40%)" → HSL。
 * h 任意数(调用方负责取模),s/l 裁剪 0–100;hsla 带 alpha<1 → null(同 rgbTextToRgb)。
 */
export function hslTextToHsl(text: string): Hsl | null {
  if (typeof text !== "string") return null;
  const m = HSL_TEXT.exec(text.trim());
  if (!m) return null;
  const alpha = m[4];
  if (alpha !== undefined) {
    const a = Number(alpha);
    if (!Number.isFinite(a) || a < 0 || a > 1) return null;
    if (a < 1) return null;
  }
  const h = Number(m[1]);
  if (!Number.isFinite(h)) return null;
  const s = Math.min(100, Math.max(0, pctOf(m[2])));
  const l = Math.min(100, Math.max(0, pctOf(m[3])));
  return { h, s, l };
}

/* ------------------------------------------------------------------ */
/* 格式探测                                                            */
/* ------------------------------------------------------------------ */

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/** 探测输入串属于哪种本站支持的格式;都不像则 null。 */
export function detectColorFormat(input: string): ColorFormat | null {
  if (typeof input !== "string") return null;
  const s = input.trim();
  if (s === "") return null;
  if (/^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(s)) return "hex";
  if (/^rgba?\(/i.test(s)) return "rgb";
  if (/^hsla?\(/i.test(s)) return "hsl";
  if (/^oklch\(/i.test(s)) return "oklch";
  return null;
}

/* ------------------------------------------------------------------ */
/* OKLCH(Ottosson 2020)                                              */
/* ------------------------------------------------------------------ */

export type Oklch = { /** 0–1 */ l: number; /** 0–~0.4 */ c: number; /** 0–360 */ h: number };

const srgbToLinear = (v: number): number => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (v: number): number => {
  const s = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return s * 255;
};

/** hex → OKLCH。非法输入 null。中性色 c 视为 0、h 记 0。 */
export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  if (c < 1e-6) h = 0; // 感知零彩度(白/黑/灰)的浮点残差 → 记 0
  return { l: L, c, h };
}

/**
 * OKLCH → hex。l/h 任意数(h 取模),l/c 裁剪到合法域;
 * 超出色域的 chroma 按通道截断近似(文档与 FAQ 披露)。非法输入 null。
 */
export function oklchToHex(l: number, c: number, h: number): string | null {
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return null;
  const L = Math.min(1, Math.max(0, l));
  const C = Math.max(0, c);
  const rad = (((h % 360) + 360) % 360) * (Math.PI / 180);
  const A = C * Math.cos(rad);
  const B = C * Math.sin(rad);

  const lin = L + 0.3963377774 * A + 0.2158037573 * B;
  const min = L - 0.1055613458 * A - 0.0638541728 * B;
  const sat = L - 0.0894841775 * A - 1.291485548 * B;

  const l3 = lin ** 3, m3 = min ** 3, s3 = sat ** 3;

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return rgbToHex(linearToSrgb(Math.min(1, Math.max(0, r))), linearToSrgb(Math.min(1, Math.max(0, g))), linearToSrgb(Math.min(1, Math.max(0, b))));
}

/** "oklch(0.628 0.258 29.23)" / "oklch(62.8% 0.258 29.23)" → Oklch。 */
export function oklchTextToOklch(text: string): Oklch | null {
  if (typeof text !== "string") return null;
  const m = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)$/i.exec(text.trim());
  if (!m) return null;
  const lRaw = Number(m[1].replace(/%$/, ""));
  if (!Number.isFinite(lRaw)) return null;
  const l = m[1].endsWith("%") ? lRaw / 100 : lRaw;
  const c = Number(m[2]);
  const h = Number(m[3]);
  if (!Number.isFinite(c) || !Number.isFinite(h)) return null;
  return { l, c, h };
}

/* ------------------------------------------------------------------ */
/* 调色板:色轮和声                                                     */
/* ------------------------------------------------------------------ */

export type Harmony =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

export const HARMONIES: Harmony[] = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "tetradic",
  "monochromatic",
];

/** 每种和声的色相偏移表(色轮标准定义;monochromatic 走专属明度阶梯)。 */
const HARMONY_HUES: Record<Exclude<Harmony, "monochromatic">, number[]> = {
  complementary: [0, 180],
  analogous: [-60, -30, 0, 30, 60],
  triadic: [0, 120, 240],
  "split-complementary": [0, 150, 210],
  tetradic: [0, 90, 180, 270],
};

/**
 * 基色 + 和声 → 5 色调色板(每个 swatch 都不同,monochromatic 为明度阶梯)。
 * 不足 5 个色相的和声按轮次循环,每多一轮统一提亮 +18(裁剪 0–100);
 * 单色和声用对称明度阶梯 [-24,-12,0,+12,+24]。
 * 灰色基色(s=0)产出灰阶——色相对灰色无效,这是物理事实而非 bug。
 * 非法基色返回 null。
 */
export function generatePalette(baseColor: string, harmony: Harmony): string[] | null {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return null;
  if (harmony === "monochromatic") {
    return [-24, -12, 0, 12, 24].map((d) => hslToHex(hsl.h, hsl.s, hsl.l + d));
  }
  const hues = HARMONY_HUES[harmony];
  if (!hues) return null; // 运行时未知和声(类型系统之外)诚实返回 null,不抛异常
  const out: string[] = [];
  for (let i = 0; i < 5; i++) {
    const pass = Math.floor(i / hues.length); // 第 0 轮原明度,后续每轮 +18
    const l = pass === 0 ? hsl.l : Math.min(100, hsl.l + pass * 18);
    out.push(hslToHex(hsl.h + hues[i % hues.length], hsl.s, l));
  }
  return out;
}

/** 5 色调色板 → CSS 变量块(原样输出传入的字符串,调用方传 hex)。 */
export function paletteToCssVariables(colors: string[]): string {
  const body = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n");
  return `:root {\n${body}\n}`;
}

/* ------------------------------------------------------------------ */
/* 色盲模拟(Viénot et al. 1999,线性 RGB 矩阵)                        */
/* ------------------------------------------------------------------ */

export type ColorBlindnessType = "protanopia" | "deuteranopia" | "tritanopia";

export const CB_TYPES: ColorBlindnessType[] = ["protanopia", "deuteranopia", "tritanopia"];

/**
 * 模拟矩阵(行和为 1 ⇒ 灰色不变)。作用于线性 RGB,再走 sRGB 伽马回显。
 * 来源:Viénot, Brettel & Mollon (1999) "Digital video colourmaps for checking
 * the legibility of displays by dichromats",标量保留 5 位小数的通行版本。
 */
export const CB_MATRICES: Record<ColorBlindnessType, readonly (readonly [number, number, number])[]> = {
  protanopia: [
    [0.11238, 0.88762, 0.0],
    [0.11238, 0.88762, 0.0],
    [0.00405, -0.00405, 1.0],
  ],
  deuteranopia: [
    [0.29275, 0.70725, 0.0],
    [0.29275, 0.70725, 0.0],
    [-0.02234, 0.02234, 1.0],
  ],
  tritanopia: [
    [1.0, 0.14461, -0.14461],
    [0.0, 0.85539, 0.14461],
    [0.0, 0.85539, 0.14461],
  ],
};

/** 对单个线性 RGB 向量施加模拟矩阵并返回线性结果(截断到 0–1)。 */
function applyMatrix(r: number, g: number, b: number, m: readonly (readonly [number, number, number])[]): [number, number, number] {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clamp01(m[0][0] * r + m[0][1] * g + m[0][2] * b),
    clamp01(m[1][0] * r + m[1][1] * g + m[1][2] * b),
    clamp01(m[2][0] * r + m[2][1] * g + m[2][2] * b),
  ];
}

/**
 * 单色模拟:hex → 模拟后的 hex。非法颜色返回 null;未知 type 返回 null。
 * 典型锚点:#ff0000 在 deuteranopia 下 ≈ #939300(红→暗黄),protanopia 下 ≈ 暗橄榄。
 */
export function simulateColorBlindness(hex: string, type: ColorBlindnessType): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const m = CB_MATRICES[type];
  if (!m) return null;
  const [r, g, b] = applyMatrix(srgbToLinear(rgb.r), srgbToLinear(rgb.g), srgbToLinear(rgb.b), m);
  return rgbToHex(linearToSrgb(r), linearToSrgb(g), linearToSrgb(b));
}

/**
 * 就地模拟一块 RGBA 像素(canvas ImageData.data)。alpha 通道原样保留;
 * 非法 type 不动数据。引擎在事件处理器里调用,Node 测试用小数组验证。
 */
export function simulateRgbaPixels(data: Uint8ClampedArray, type: ColorBlindnessType): void {
  const m = CB_MATRICES[type];
  if (!m) return;
  for (let i = 0; i + 3 < data.length; i += 4) {
    const [r, g, b] = applyMatrix(srgbToLinear(data[i]), srgbToLinear(data[i + 1]), srgbToLinear(data[i + 2]), m);
    data[i] = linearToSrgb(r);
    data[i + 1] = linearToSrgb(g);
    data[i + 2] = linearToSrgb(b);
  }
}

/* ------------------------------------------------------------------ */
/* WCAG 文本色搜索                                                     */
/* ------------------------------------------------------------------ */

const WHITE = "#ffffff";
const BLACK = "#000000";

/**
 * sRGB 线性插值:t=0 → a,t=1 → b;t 裁剪 0–1;任一颜色非法 → null。
 * 逐通道四舍五入到整数字节。
 */
export function mixHex(a: string, b: string, t: number): string | null {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb || !Number.isFinite(t)) return null;
  const k = Math.min(1, Math.max(0, t));
  return rgbToHex(ca.r + (cb.r - ca.r) * k, ca.g + (cb.g - ca.g) * k, ca.b + (cb.b - ca.b) * k);
}

export type TextShade = {
  /** 恰好达标的文本色(离白/黑端最近)。 */
  color: string;
  /** 该色对背景的对比度(全精度,展示层再舍入)。 */
  ratio: number;
  /** 混合系数:0 = 纯白/纯黑,1 = 对侧端点。 */
  t: number;
};

/**
 * 在背景色上搜索一个达到 target 对比度的文本色:
 * from="white" 从 #ffffff 向 #000000 混合,from="black" 反向。
 * 返回第一个(最小调整)达标色:粗扫 0.01 步长定界,再 30 轮二分逼近;
 * 混合比对度是单调的(逐通道线性递减 ⇒ 亮度单调),因此该点是唯一的
 * “最近达标色”。整段(纯白/纯黑)已达标则原样返回 t=0。
 * 两端都到头仍不达标(如纯白背景上的白字)返回 null——诚实呈现不可达。
 * 背景非法 → null。
 */
export function findTextShade(bg: string, target: number, from: "white" | "black"): TextShade | null {
  if (!Number.isFinite(target) || target <= 0) return null;
  const anchor = from === "white" ? WHITE : BLACK;
  const other = from === "white" ? BLACK : WHITE;

  const ratioAt = (t: number): number => {
    const c = mixHex(anchor, other, t);
    return c === null ? NaN : contrastRatio(c, bg);
  };

  if (!Number.isFinite(ratioAt(0))) return null; // 背景非法
  if (ratioAt(0) >= target) return { color: anchor, ratio: ratioAt(0), t: 0 };
  if (ratioAt(1) < target) return null; // 到对侧端点仍不达标

  // 粗扫:找第一个达标步(0.01 步长,100 步封顶)
  let hi = 1;
  for (let step = 1; step <= 100; step++) {
    const t = step / 100;
    if (ratioAt(t) >= target) {
      hi = t;
      break;
    }
  }
  // 二分:把边界收敛到 0.01 区间内,取区间内最小达标 t
  let lo = hi - 0.01 > 0 ? hi - 0.01 : 0;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (ratioAt(mid) >= target) hi = mid;
    else lo = mid;
  }
  const t = hi;
  return { color: mixHex(anchor, other, t)!, ratio: ratioAt(t), t };
}

/** 背景 vs 纯白/纯黑谁对比度更高;打平取黑(深色文字是网页常态)。非法背景 → null。 */
export function bestTextColorOn(bg: string): { color: string; ratio: number } | null {
  const rw = contrastRatio(WHITE, bg);
  const rb = contrastRatio(BLACK, bg);
  if (!Number.isFinite(rw) || !Number.isFinite(rb)) return null;
  return rb >= rw ? { color: BLACK, ratio: rb } : { color: WHITE, ratio: rw };
}
