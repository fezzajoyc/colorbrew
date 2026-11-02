import { describe, expect, it } from "vitest";
import {
  bestTextColorOn,
  detectColorFormat,
  findTextShade,
  generatePalette,
  hexToOklch,
  hexToRgb,
  hslTextToHsl,
  mixHex,
  oklchTextToOklch,
  oklchToHex,
  paletteToCssVariables,
  rgbTextToRgb,
  rgbToHex,
  rgbToHsl,
  simulateColorBlindness,
  simulateRgbaPixels,
  CB_MATRICES,
  CB_TYPES,
  HARMONIES,
  type Harmony,
} from "@/tools/_lib/color-extra";
import { contrastRatio, parseColor, relativeLuminance, wcagBadges } from "@/tools/_lib/contrast";
import { gradientCss, hslToHex, hexToHsl } from "@/tools/_lib/gradient";

const channelsOf = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/* ---------------- HEX ↔ RGB ---------------- */

describe("hexToRgb: formats and rejections", () => {
  it("parses 6-digit, 3-digit and bare hex (documented: no named colors)", () => {
    expect(hexToRgb("#7C3AED")).toEqual({ r: 124, g: 58, b: 237 });
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("cafe12")).toEqual({ r: 0xca, g: 0xfe, b: 0x12 });
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 }); // 大小写不敏感
  });

  it("returns null for empty, malformed, short and non-hex input", () => {
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#12")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull(); // 5 位
    expect(hexToRgb("#1234567")).toBeNull(); // 7 位
    expect(hexToRgb("zzzzzz")).toBeNull();
    expect(hexToRgb("#gggggg")).toBeNull();
    expect(hexToRgb("rgb(1,2,3)")).toBeNull();
  });
});

describe("rgbToHex: clamping, rounding, non-finite safety", () => {
  it("clamps out-of-range channels into 0–255", () => {
    expect(rgbToHex(-5, 300, 255)).toBe("#00ffff");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
  });

  it("rounds fractional channels to the nearest byte", () => {
    expect(rgbToHex(127.4, 127.6, 255.5)).toBe("#7f80ff");
  });

  it("treats non-finite channels as 0 instead of emitting NaN", () => {
    expect(rgbToHex(NaN, Infinity, -Infinity)).toBe("#000000");
  });
});

describe("rgbToHsl: known vectors match gradient.hexToHsl", () => {
  it("red, steel-blue and gray convert exactly", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    const steel = rgbToHsl(0x33, 0x66, 0x99);
    expect(steel.h).toBeCloseTo(210, 6);
    expect(steel.s).toBeCloseTo(50, 6);
    expect(steel.l).toBeCloseTo(40, 6);
    expect(rgbToHsl(128, 128, 128).s).toBe(0);
  });
});

/* ---------------- 文本解析(rgb/hsl)与格式探测 ---------------- */

describe("rgbTextToRgb and hslTextToHsl: legacy, modern, alpha policy", () => {
  it("accepts comma and space syntax, with clamping", () => {
    expect(rgbTextToRgb("rgb(51, 102, 153)")).toEqual({ r: 51, g: 102, b: 153 });
    expect(rgbTextToRgb("rgb(51 102 153)")).toEqual({ r: 51, g: 102, b: 153 });
    expect(rgbTextToRgb("rgb(300, -5, 0)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbTextToRgb("RGB(0,0,0)")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("accepts percentage channels", () => {
    expect(rgbTextToRgb("rgb(50% 0% 100%)")).toEqual({ r: 128, g: 0, b: 255 });
  });

  it("rejects alpha colors instead of flattening (documented policy)", () => {
    expect(rgbTextToRgb("rgba(0, 0, 0, 0.5)")).toBeNull();
    expect(rgbTextToRgb("rgba(0, 0, 0, 1)")).toEqual({ r: 0, g: 0, b: 0 });
    expect(rgbTextToRgb("rgba(0, 0, 0, 2)")).toBeNull();
  });

  it("rejects malformed input without throwing", () => {
    expect(rgbTextToRgb("")).toBeNull();
    expect(rgbTextToRgb("rgb(1,2)")).toBeNull();
    expect(rgbTextToRgb("garbage")).toBeNull();
    expect(hslTextToHsl("hsl(1,2)")).toBeNull();
    expect(hslTextToHsl("hsl(orange)")).toBeNull();
  });

  it("parses hsl text in all syntaxes, clamping s/l and passing h through", () => {
    expect(hslTextToHsl("hsl(210, 50%, 40%)")).toEqual({ h: 210, s: 50, l: 40 });
    expect(hslTextToHsl("hsl(210 50% 40%)")).toEqual({ h: 210, s: 50, l: 40 });
    expect(hslTextToHsl("hsl(210deg, 50%, 40%)")).toEqual({ h: 210, s: 50, l: 40 });
    expect(hslTextToHsl("hsl(-90, 150%, -10%)")).toEqual({ h: -90, s: 100, l: 0 });
    expect(hslTextToHsl("hsla(210, 50%, 40%, 0.5)")).toBeNull();
    expect(hslTextToHsl("hsla(210, 50%, 40%, 1)")).toEqual({ h: 210, s: 50, l: 40 });
  });
});

describe("detectColorFormat: format sniffing", () => {
  it("detects hex, rgb, hsl and oklch", () => {
    expect(detectColorFormat("#7C3AED")).toBe("hex");
    expect(detectColorFormat("cafe12")).toBe("hex");
    expect(detectColorFormat("rgb(1 2 3)")).toBe("rgb");
    expect(detectColorFormat("hsl(210, 50%, 40%)")).toBe("hsl");
    expect(detectColorFormat("oklch(0.541 0.247 293)")).toBe("oklch");
  });

  it("returns null for empty, named or garbage input", () => {
    expect(detectColorFormat("")).toBeNull();
    expect(detectColorFormat("red")).toBeNull();
    expect(detectColorFormat("#12345")).toBeNull();
    expect(detectColorFormat("oklab(0.5 0.1 0.1)")).toBeNull();
  });
});

/* ---------------- OKLCH ---------------- */

describe("hexToOklch: anchors from the standard Ottosson matrices", () => {
  // 锚值由独立的参考实现计算(mcp 测试同源),容差 1e-3。
  it("converts red, blue, orange, white and black to the published values", () => {
    const red = hexToOklch("#ff0000")!;
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 3);
    expect(red.h).toBeCloseTo(29.23, 1);

    const blue = hexToOklch("#0000ff")!;
    expect(blue.l).toBeCloseTo(0.452, 3);
    expect(blue.c).toBeCloseTo(0.3132, 3);
    expect(blue.h).toBeCloseTo(264.05, 1);

    const orange = hexToOklch("#f97316")!;
    expect(orange.l).toBeCloseTo(0.7049, 3);
    expect(orange.c).toBeCloseTo(0.1867, 3);
    expect(orange.h).toBeCloseTo(47.6, 1);

    const white = hexToOklch("#ffffff")!;
    expect(white.l).toBeCloseTo(1, 5);
    expect(white.c).toBeLessThan(1e-6); // 中性色 h 记 0
    expect(white.h).toBe(0);

    const black = hexToOklch("#000000")!;
    expect(black.l).toBe(0);
    expect(black.c).toBe(0);
    expect(black.h).toBe(0);
  });

  it("returns null for invalid hex", () => {
    expect(hexToOklch("nope")).toBeNull();
    expect(hexToOklch("")).toBeNull();
  });
});

describe("oklchToHex and oklchTextToOklch: round-trip and parsing", () => {
  it("round-trips hex → oklch → hex within one bit per channel", () => {
    const colors = ["#7C3AED", "#0EA5E9", "#F97316", "#84CC16", "#EC4899", "#1F2937", "#F3F4F6"];
    for (const c of colors) {
      const ok = hexToOklch(c)!;
      const back = oklchToHex(ok.l, ok.c, ok.h)!;
      const a = channelsOf(c);
      const b = channelsOf(back);
      for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i]), `${c} → ${back}`).toBeLessThanOrEqual(1);
    }
  });

  it("wraps negative and >360 hues into range", () => {
    const ok = hexToOklch("#ff0000")!;
    expect(oklchToHex(ok.l, ok.c, ok.h - 360)).toBe(oklchToHex(ok.l, ok.c, ok.h));
    expect(oklchToHex(ok.l, ok.c, ok.h + 720)).toBe(oklchToHex(ok.l, ok.c, ok.h));
  });

  it("returns null for non-finite components", () => {
    expect(oklchToHex(NaN, 0.1, 90)).toBeNull();
    expect(oklchToHex(0.5, 0.1, Infinity)).toBeNull();
  });

  it("parses oklch() text with absolute and percent lightness", () => {
    expect(oklchTextToOklch("oklch(0.628 0.2577 29.23)")).toEqual({ l: 0.628, c: 0.2577, h: 29.23 });
    expect(oklchTextToOklch("oklch(62.8% 0.2577 29.23)")!.l).toBeCloseTo(0.628, 4);
    expect(oklchTextToOklch("oklch(0.5 0.1)")).toBeNull();
    expect(oklchTextToOklch("oklch(red)")).toBeNull();
    expect(oklchTextToOklch("")).toBeNull();
  });
});

/* ---------------- 调色板和声 ---------------- */

describe("generatePalette: color-wheel harmony math", () => {
  it("complementary alternates base and +180° hue, lifting later rounds by +18 lightness", () => {
    const p = generatePalette("#336699", "complementary")!;
    expect(p).toHaveLength(5);
    expect(p[0]).toBe("#336699");
    expect(p[1]).toBe("#996633"); // rotateHue(+180°) 的已验证锚点
    // i2: 同基色相(210°),明度 40+18=58(字节取整允许 <0.5 的往返误差)
    const secondRound = hexToHsl(p[2])!;
    expect(Math.abs(secondRound.h - 210)).toBeLessThanOrEqual(1);
    expect(secondRound.l).toBeCloseTo(58, 0);
    expect(secondRound.s).toBeCloseTo(50, 0);
  });

  it("analogous spans ±60° around the base hue", () => {
    const base = hexToHsl("#E11D48")!;
    const p = generatePalette("#E11D48", "analogous")!;
    const hues = p.map((c) => hexToHsl(c)!.h);
    const deltas = hues.map((h) => ((h - base.h + 540) % 360) - 180);
    for (let i = 0; i < 5; i++) expect(Math.abs(deltas[i] - [-60, -30, 0, 30, 60][i]), `${i}`).toBeLessThanOrEqual(1);
  });

  it("monochromatic walks a symmetric lightness ramp on one hue", () => {
    const p = generatePalette("#336699", "monochromatic")!;
    const ls = p.map((c) => hexToHsl(c)!.l);
    expect(ls.map((l) => Math.round(l))).toEqual([16, 28, 40, 52, 64]);
    for (const c of p) expect(Math.abs(hexToHsl(c)!.h - 210)).toBeLessThanOrEqual(1);
  });

  it("every harmony yields five distinct swatches on a saturated base", () => {
    for (const harmony of HARMONIES) {
      const p = generatePalette("#7C3AED", harmony)!;
      expect(p, harmony).toHaveLength(5);
      expect(new Set(p).size, harmony).toBe(5);
    }
  });

  it("clamps lightness at the extremes instead of escaping 0–100", () => {
    const p = generatePalette("#fefefe", "monochromatic")!;
    for (const c of p) {
      const l = hexToHsl(c)!.l;
      expect(l).toBeLessThanOrEqual(100.0001);
      expect(l).toBeGreaterThanOrEqual(0);
    }
  });

  it("a gray base stays gray across every harmony (saturation 0 is hue-immune)", () => {
    for (const harmony of HARMONIES) {
      const p = generatePalette("#808080", harmony)!;
      for (const c of p) expect(hexToHsl(c)!.s, `${harmony} ${c}`).toBeCloseTo(0, 4);
    }
  });

  it("returns null for invalid base colors and unknown harmony (never throws)", () => {
    expect(generatePalette("nope", "complementary")).toBeNull();
    expect(generatePalette("", "triadic")).toBeNull();
    expect(generatePalette("#336699", "no-such-harmony" as Harmony)).toBeNull();
  });

  it("exports the CSS variable block with --color-1..5", () => {
    const css = paletteToCssVariables(["#111111", "#222222", "#333333", "#444444", "#555555"]);
    expect(css).toBe(
      ":root {\n  --color-1: #111111;\n  --color-2: #222222;\n  --color-3: #333333;\n  --color-4: #444444;\n  --color-5: #555555;\n}",
    );
  });
});

/* ---------------- 色盲模拟 ---------------- */

describe("color blindness simulation: Viénot matrices", () => {
  it("matrix rows sum to 1 so neutral grays map onto themselves", () => {
    for (const type of CB_TYPES) {
      for (const row of CB_MATRICES[type]) {
        expect(row[0] + row[1] + row[2], `${type}`).toBeCloseTo(1, 10);
      }
      for (const gray of ["#808080", "#ffffff", "#000000"]) {
        expect(simulateColorBlindness(gray, type), `${type} ${gray}`).toBe(gray);
      }
    }
  });

  it("matches anchors computed by an independent implementation", () => {
    // 锚值由独立脚本(测试仓库外)按同一矩阵手工重算得出
    expect(simulateColorBlindness("#ff0000", "protanopia")).toBe("#5e5e0d");
    expect(simulateColorBlindness("#ff0000", "deuteranopia")).toBe("#939300"); // 红 → 暗黄
    expect(simulateColorBlindness("#ff0000", "tritanopia")).toBe("#ff0000");
    expect(simulateColorBlindness("#0000ff", "tritanopia")).toBe("#006a6a");
    expect(simulateColorBlindness("#336699", "protanopia")).toBe("#626299");
    expect(simulateColorBlindness("#00ff00", "deuteranopia")).toBe("#dbdb29");
  });

  it("accepts 3-digit hex and returns null for invalid colors or types", () => {
    expect(simulateColorBlindness("#f00", "deuteranopia")).toBe(simulateColorBlindness("#ff0000", "deuteranopia"));
    expect(simulateColorBlindness("nope", "deuteranopia")).toBeNull();
    expect(simulateColorBlindness("#ff0000", "no-such-type" as never)).toBeNull();
  });

  it("simulateRgbaPixels matches per-color results and preserves alpha", () => {
    const red = [255, 0, 0, 255];
    const gray = [128, 128, 128, 200];
    const data = new Uint8ClampedArray([...red, ...gray]);
    simulateRgbaPixels(data, "deuteranopia");
    const deuteranopiaRed = channelsOf(simulateColorBlindness("#ff0000", "deuteranopia")!);
    expect([...data.slice(0, 3)]).toEqual(deuteranopiaRed);
    expect(data[3]).toBe(255); // alpha 原样
    expect([...data.slice(4, 7)]).toEqual([128, 128, 128]); // 灰不变
    expect(data[7]).toBe(200);
  });

  it("simulateRgbaPixels leaves trailing non-pixel bytes and unknown types untouched", () => {
    const data = new Uint8ClampedArray([255, 0, 0, 255, 250, 251]); // 末尾 2 字节不足一个像素
    const copy = new Uint8ClampedArray(data);
    simulateRgbaPixels(data, "protanopia");
    expect([...data.slice(4)]).toEqual([...copy.slice(4)]);
    const data2 = new Uint8ClampedArray([255, 0, 0, 255]);
    simulateRgbaPixels(data2, "no-such-type" as never);
    expect([...data2]).toEqual([255, 0, 0, 255]);
  });
});

/* ---------------- WCAG 文本色搜索 ---------------- */

describe("mixHex: linear interpolation in sRGB", () => {
  it("returns the anchors at t=0/1 and the midpoint gray at t=0.5", () => {
    expect(mixHex("#ffffff", "#000000", 0)).toBe("#ffffff");
    expect(mixHex("#ffffff", "#000000", 1)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHex("#000000", "#ffffff", 0.25)).toBe("#404040");
  });

  it("clamps t outside 0–1 and returns null for invalid colors", () => {
    expect(mixHex("#000000", "#ffffff", -3)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 9)).toBe("#ffffff");
    expect(mixHex("nope", "#ffffff", 0.5)).toBeNull();
    expect(mixHex("#000000", "nope", 0.5)).toBeNull();
    expect(mixHex("#000000", "#ffffff", NaN)).toBeNull();
  });
});

describe("findTextShade: minimal passing shades", () => {
  it("finds the famous #767676 — the lightest AA gray on white", () => {
    const r = findTextShade("#ffffff", 4.5, "white")!;
    expect(r.color).toBe("#767676");
    expect(r.ratio).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(r.color, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("returns pure white/black untouched when they already pass (t = 0)", () => {
    expect(findTextShade("#1e3a8a", 4.5, "white")!.color).toBe("#ffffff");
    expect(findTextShade("#1e3a8a", 7, "white")!.color).toBe("#ffffff");
    expect(findTextShade("#ffffff", 7, "black")!.color).toBe("#000000");
    expect(findTextShade("#767676", 4.5, "white")!.color).toBe("#ffffff"); // 4.54 ≥ 4.5
  });

  it("reports unreachable levels as null instead of inventing a color", () => {
    // 中灰上 7:1:连纯黑也只到 ~5.3:1,白端整条混合线都不可达
    expect(findTextShade("#808080", 7, "white")).toBeNull();
    expect(findTextShade("#808080", 7, "black")).toBeNull();
    // 目标超过理论上限 21:1
    expect(findTextShade("#ffffff", 21.5, "black")).toBeNull();
  });

  it("every result passes its target, and one step lighter toward the anchor fails (minimality)", () => {
    const cases: [string, number, "white" | "black"][] = [
      ["#f9fafb", 4.5, "white"],
      ["#f9fafb", 4.5, "black"],
      ["#1e3a8a", 7, "black"],
      ["#7C3AED", 3, "white"],
      ["#7C3AED", 4.5, "black"],
      ["#94a3b8", 4.5, "white"],
    ];
    for (const [bg, target, from] of cases) {
      const anchor = from === "white" ? "#ffffff" : "#000000";
      const other = from === "white" ? "#000000" : "#ffffff";
      const r = findTextShade(bg, target, from);
      expect(r, `${bg}/${target}/${from}`).not.toBeNull();
      expect(contrastRatio(r!.color, bg), `${bg}/${target}/${from} passes`).toBeGreaterThanOrEqual(target);
      // 最小性:往锚点方向退一步(t−0.01)就不再达标
      if (r!.t > 0.011) {
        const step = mixHex(anchor, other, r!.t - 0.01)!;
        expect(contrastRatio(step, bg), `${bg}/${target}/${from} minimal`).toBeLessThan(target);
      }
    }
  });

  it("returns null for invalid backgrounds and invalid targets", () => {
    expect(findTextShade("nope", 4.5, "white")).toBeNull();
    expect(findTextShade("#ffffff", NaN, "white")).toBeNull();
    expect(findTextShade("#ffffff", 0, "white")).toBeNull();
    expect(findTextShade("#ffffff", -1, "black")).toBeNull();
  });
});

describe("bestTextColorOn: white vs black pick", () => {
  it("picks black on white and white on black, with exact 21:1 anchors", () => {
    expect(bestTextColorOn("#ffffff")).toEqual({ color: "#000000", ratio: 21 });
    expect(bestTextColorOn("#000000")).toEqual({ color: "#ffffff", ratio: 21 });
  });

  it("picks the higher-contrast side on mid tones and null on invalid input", () => {
    const r = bestTextColorOn("#336699")!;
    const rw = contrastRatio("#ffffff", "#336699");
    const rb = contrastRatio("#000000", "#336699");
    expect(r.color).toBe(rb >= rw ? "#000000" : "#ffffff");
    expect(r.ratio).toBeCloseTo(Math.max(rw, rb), 10);
    expect(bestTextColorOn("garbage")).toBeNull();
  });
});

/* ---------------- 接线函数回归:contrast.ts 与 gradient.ts ---------------- */

describe("wired lib functions: contrast and gradient vectors", () => {
  it("contrastRatio and wcagBadges agree at the WCAG thresholds", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
    expect(wcagBadges(4.54)).toEqual({ aaNormal: true, aaaNormal: false, aaLarge: true, aaaLarge: true });
    expect(wcagBadges(4.49)).toEqual({ aaNormal: false, aaaNormal: false, aaLarge: true, aaaLarge: false });
    expect(Number.isNaN(contrastRatio("nope", "#ffffff"))).toBe(true);
  });

  it("parseColor and relativeLuminance keep their documented contract", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    // alpha 压平到白底:0·0.5 + 255·0.5 = 127.5(全精度浮点,不取整)
    expect(parseColor("rgba(0, 0, 0, 0.5)")).toEqual({ r: 127.5, g: 127.5, b: 127.5 });
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6);
  });

  it("gradientCss still emits the canonical two-stop line the engines rely on", () => {
    expect(
      gradientCss(
        [
          { color: "#0EA5E9", position: 0 },
          { color: "#8B5CF6", position: 100 },
        ],
        "linear",
        45,
      ),
    ).toBe("linear-gradient(45deg, #0EA5E9 0%, #8B5CF6 100%)");
    expect(gradientCss([{ color: "#0EA5E9" }], "linear", 45)).toBeNull();
  });

  it("hslToHex round-trips the hsl text parser within one bit", () => {
    const hsl = hslTextToHsl("hsl(262, 83%, 58%)")!;
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    // hsl(262,83%,58%) 与 #7c3aed 的真实 HSL 差半位,往返误差按 ±1 位/通道判定
    const a = channelsOf("#7c3aed");
    const b = channelsOf(hex);
    for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i]), hex).toBeLessThanOrEqual(1);
    // 精确往返:hex → hsl → hex
    const exact = hexToHsl("#7c3aed")!;
    expect(hslToHex(exact.h, exact.s, exact.l)).toBe("#7c3aed");
  });
});
