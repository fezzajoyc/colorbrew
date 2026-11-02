import gradientMaker from "./gradient-maker";
import contrastChecker from "./contrast-checker";
import colorConverter from "./color-converter";
import paletteGenerator from "./palette-generator";
import colorBlindnessSimulator from "./color-blindness-simulator";
import contrastText from "./contrast-text";

/** ColorBrew 的 6 个颜色工具(唯一注册入口,tools/registry.ts 聚合)。 */
export const COLOR_TOOLS = [
  gradientMaker,
  contrastChecker,
  colorConverter,
  paletteGenerator,
  colorBlindnessSimulator,
  contrastText,
];
