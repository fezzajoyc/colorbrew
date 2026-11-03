import type { CategoryId, Locale } from "@/lib/site";
import type { ToolCopy } from "./types";

/**
 * 类目 FAQ 池:工具页 FAQ 不足 6 条时按类目补齐(JSON-LD 同源走 toolCopy)。
 * 内容写"这个类目共同的真问题"(隐私/收费/格式/精度/浏览器支持),不是凑数占位。
 * 只写核心 5 语(en/zh/ja/es/pt);其他 locale toolCopy 本来就走 overlay 或回退 en。
 */
type Faq = { q: string; a: string };

const GLOBAL: Partial<Record<Locale, Faq[]>> = {
  en: [
    { q: "Do I need design software for ColorBrew?", a: "No. ColorBrew's color work tools run in any modern browser with no plugins, no installs and no accounts — open the page and start working." },
    { q: "Are the colors and values exact?", a: "Yes — color work math follows the WCAG specifications and standard color-space formulas, computed locally with full precision rather than rounded lookup tables." },
    { q: "Can I use ColorBrew offline?", a: "Once the page has loaded, yes. All color work processing is local JavaScript, so an interrupted connection does not interrupt your work." },
  ],
  zh: [
    { q: "需要装设计软件吗?", a: "不需要。ColorBrew的色彩工具在任何现代浏览器里运行,无插件、无安装、无账号 — 打开页面就能干活。" },
    { q: "颜色和数值精确吗?", a: "精确 — 色彩计算遵循 WCAG 规范和标准色彩空间公式,本地全精度计算,不是四舍五入的查表。" },
    { q: "离线能用吗?", a: "页面加载后可以。所有色彩处理都是本地 JavaScript,断网不影响手头的工作。" },
  ],
  ja: [
    { q: "デザインソフトが必要ですか?", a: "不要です。ColorBrewのcolor workツールは最新のブラウザがあれば動きます。プラグイン・インストール・アカウント一切なしで、ページを開けば作業開始です。" },
    { q: "色や数値は正確ですか?", a: "正確です。color workの計算は WCAG 仕様と標準の色空間公式に従い、丸めた換算表ではなくローカルで全精度計算します。" },
    { q: "オフラインで使えますか?", a: "ページ読み込み後は可能です。color work処理はすべてローカル JavaScript のため、回線が途切れても作業は止まりません。" },
  ],
  es: [
    { q: "¿Necesito software de diseño para ColorBrew?", a: "No. Las herramientas de color work de ColorBrew funcionan en cualquier navegador moderno, sin plugins, sin instalaciones y sin cuentas — abre la página y empieza." },
    { q: "¿Los colores y valores son exactos?", a: "Sí — el cálculo de color work sigue las especificaciones WCAG y las fórmulas estándar de espacio de color, con precisión completa y local, sin tablas redondeadas." },
    { q: "¿Puedo usar ColorBrew sin conexión?", a: "Sí, una vez cargada la página. Todo el procesado de color work es JavaScript local, así que una conexión interrumpida no interrumpe tu trabajo." },
  ],
  pt: [
    { q: "Preciso de software de design para o ColorBrew?", a: "Não. As ferramentas de color work do ColorBrew rodam em qualquer navegador moderno, sem plugins, sem instalação e sem contas — abra a página e comece." },
    { q: "As cores e os valores são exatos?", a: "Sim — o cálculo de color work segue as especificações WCAG e fórmulas padrão de espaço de cor, com precisão total e local, sem tabelas arredondadas." },
    { q: "Posso usar o ColorBrew offline?", a: "Sim, depois de carregada a página. Todo o processamento de color work é JavaScript local, então uma conexão instável não interrompe seu trabalho." },
  ],
};

const BY_CATEGORY: Partial<Record<CategoryId, Partial<Record<Locale, Faq[]>>>> = {

};

/** 取某类目的补充 FAQ 池(global 池 + 类目池,en 缺省回退) */
export function categoryFaqPool(category: CategoryId, locale: Locale): Faq[] {
  const extra = BY_CATEGORY[category]?.[locale] ?? BY_CATEGORY[category]?.en ?? [];
  const global = GLOBAL[locale] ?? GLOBAL.en ?? [];
  return [...extra, ...global];
}
