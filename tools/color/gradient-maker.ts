import { defineTool } from "../_lib/types";
import { GradientMakerEngine } from "../_engines/gradient-maker";

export default defineTool({
  slug: "gradient-maker",
  category: "utility",
  icon: "layers",
  featured: true,
  engine: { component: GradientMakerEngine, props: {} },
  copy: {
    en: {
      name: "CSS Gradient Maker",
      h1: "CSS gradient maker with live preview",
      tagline:
        "Build linear, radial and conic CSS gradients from two to five color stops, tune every position and angle, and copy production-ready CSS.",
      intro: [
        "This gradient maker turns a handful of color stops into a clean CSS gradient you can paste straight into a stylesheet. Choose linear, radial or conic, drag the stops where they belong, and the preview bar updates as you type.",
        "Under the hood it follows the CSS spec: unpositioned stops are interpolated between their positioned neighbors exactly the way browsers render them, angles wrap into the 0–359° range, and equal-position stops keep their written order so a hard edge is a deliberate choice, not an accident.",
      ],
      steps: [
        "Pick two to five colors — the picker and the hex field stay in sync.",
        "Choose the gradient type; set the angle for linear and conic, or the shape for radial.",
        "Drag the position sliders, or leave them on auto to distribute stops evenly.",
        "Copy the CSS block, which includes a fallback color and a -webkit- prefixed line.",
      ],
      faqs: [
        {
          q: "What happens if I leave a stop position empty?",
          a: "Empty positions are interpolated by the same rule browsers use: the stop lands exactly between its nearest positioned neighbors, and stops before the first (or after the last) defined position clamp to that value.",
        },
        {
          q: "Why does the output include a background-color fallback?",
          a: "Browsers that cannot render gradients still show something sensible: the first stop color. The -webkit- line covers older WebKit builds, and the last line is the standard syntax every modern browser supports.",
        },
        {
          q: "How do conic gradients differ from linear ones?",
          a: "A linear gradient sweeps across the box in one direction; a conic gradient rotates around a center point like a pie chart, starting at the from-angle. Both share the same stop list here.",
        },
      ],
    },
    zh: {
      name: "CSS 渐变生成器",
      h1: "CSS 渐变生成器,实时预览",
      tagline: "用 2–5 个色标构建线性、径向、锥形 CSS 渐变,滑杆精确控制位置与角度,实时预览,一键复制可直接上线的代码。",
      intro: [
        "把几个色标变成一行可以直接粘进样式表的 CSS 渐变。选线性、径向或锥形,拖动色标位置,预览条随输入即时更新。",
        "生成逻辑遵循 CSS 规范:未定位的色标按浏览器渲染规则在相邻已定位色标间插值,角度自动归一到 0–359°,等位色标按书写顺序稳定排序,硬分隔是刻意可选的效果。",
      ],
      steps: [
        "选两到五个颜色,取色器与十六进制输入保持同步。",
        "选渐变类型;线性与锥形设角度,径向选形状。",
        "拖动位置滑杆,或保持自动让 CSS 均匀分布。",
        "复制 CSS 代码块,内含回退色与 -webkit- 前缀行。",
      ],
      faqs: [
        {
          q: "色标位置留空会怎样?",
          a: "空位置按浏览器同一规则插值:落在最近的两个已定位色标正中间;位于首个定位之前或末个之后的,贴齐该定位值。",
        },
        {
          q: "输出里为什么带 background-color 回退?",
          a: "不支持渐变的旧浏览器至少显示第一个色标色;-webkit- 行覆盖旧 WebKit 内核;最后一行是所有现代浏览器支持的标准语法。",
        },
        {
          q: "锥形渐变和线性渐变有什么区别?",
          a: "线性渐变沿一个方向扫过盒子;锥形渐变绕中心旋转,像饼图,从起始角度开始。两者在这里共用同一份色标列表。",
        },
      ],
    },
    ja: {
      name: "CSS グラデーションメーカー",
      h1: "ライブプレビュー付き CSS グラデーションメーカー",
      tagline:
        "2〜5 のカラーストップで線形・円形・円錐グラデーションを構築。位置と角度をスライダーで調整し、本番対応の CSS をワンクリックでコピーできます。",
      intro: [
        "いくつかのカラーストップを、スタイルシートにそのまま貼れる 1 行の CSS グラデーションに変換します。線形・円形・円錐を選び、ストップを動かすとプレビューが即座に更新されます。",
        "生成は CSS 仕様に従います。位置未指定のストップは隣接する定位ストップ間で補間され、角度は 0〜359° に正規化、同位置のストップは記述順に安定ソートされ、意図的なハードエッジを作れます。",
      ],
      steps: [
        "2〜5 色を選択(ピッカーと HEX 入力は同期)。",
        "種類を選択。線形・円錐は角度、円形は形状を設定。",
        "位置スライダーを動かすか、自動のままで均等配置。",
        "フォールバック色と -webkit- 行を含む CSS ブロックをコピー。",
      ],
      faqs: [
        {
          q: "ストップ位置を空にした場合は?",
          a: "空の位置はブラウザーと同じ規則で補間されます。近くの定位ストップの正中間に置かれ、最初(または最後)の定位より前(後)はその値に固定されます。",
        },
        {
          q: "出力に background-color があるのはなぜ?",
          a: "グラデーション非対応の古いブラウザーでも最初のストップ色を表示させるためです。-webkit- 行は旧 WebKit 用、最終行が現行標準構文です。",
        },
        {
          q: "円錐と線形の違いは?",
          a: "線形はボックスを一方向に掃き、円錐は中心の周りを円グラフのように回転します。両者ともここでは同じストップ列を共有します。",
        },
      ],
    },
    es: {
      name: "Generador de degradados CSS",
      h1: "Generador de degradados CSS con vista previa en vivo",
      tagline:
        "Crea degradados CSS lineales, radiales y cónicos con dos a cinco paradas de color, ajusta posiciones y ángulo, y copia CSS listo para producción.",
      intro: [
        "Este generador convierte unas cuantas paradas de color en un degradado CSS limpio que puedes pegar directamente en tu hoja de estilos. Elige lineal, radial o cónico y la barra de vista previa se actualiza mientras escribes.",
        "Sigue la especificación CSS: las paradas sin posición se interpolan entre sus vecinas posicionadas igual que las renderiza el navegador, los ángulos se envuelven a 0–359° y las paradas con la misma posición se ordenan de forma estable para lograr un borde duro intencional.",
      ],
      steps: [
        "Elige de dos a cinco colores: el selector y el campo hex van sincronizados.",
        "Elige el tipo; fija el ángulo para lineal y cónico, o la forma para radial.",
        "Mueve los controles de posición o déjalos en automático para repartir uniformemente.",
        "Copia el bloque CSS, que incluye color de respaldo y la línea con prefijo -webkit-.",
      ],
      faqs: [
        {
          q: "¿Qué pasa si dejo vacía la posición de una parada?",
          a: "Las posiciones vacías se interpolan con la misma regla del navegador: la parada queda exactamente entre sus vecinas posicionadas, y las que quedan antes de la primera (o tras la última) definida se fijan a ese valor.",
        },
        {
          q: "¿Por qué la salida incluye un background-color de respaldo?",
          a: "Los navegadores sin soporte de degradados siguen mostrando algo sensato: el primer color. La línea -webkit- cubre WebKit antiguo y la última es la sintaxis estándar que todos los navegadores modernos soportan.",
        },
        {
          q: "¿En qué se diferencia un degradado cónico de uno lineal?",
          a: "El lineal barre la caja en una dirección; el cónico rota alrededor de un punto central como un gráfico circular, empezando en el ángulo inicial. Ambos comparten aquí la misma lista de paradas.",
        },
      ],
    },
    pt: {
      name: "Gerador de gradiente CSS",
      h1: "Gerador de gradiente CSS com pré-visualização ao vivo",
      tagline:
        "Crie gradientes CSS lineares, radiais e cônicos com duas a cinco paradas de cor, ajuste posições e ângulo e copie um CSS pronto para produção.",
      intro: [
        "Este gerador transforma algumas paradas de cor em um gradiente CSS limpo, pronto para colar na folha de estilos. Escolha linear, radial ou cônico e a barra de pré-visualização se atualiza enquanto você digita.",
        "Segue a especificação CSS: paradas sem posição são interpoladas entre as vizinhas posicionadas exatamente como o navegador renderiza, ângulos voltam ao intervalo 0–359° e paradas na mesma posição mantêm a ordem de escrita para criar uma borda dura de propósito.",
      ],
      steps: [
        "Escolha de duas a cinco cores — o seletor e o campo hex ficam sincronizados.",
        "Escolha o tipo; defina o ângulo para linear e cônico, ou a forma para radial.",
        "Arraste os controles de posição ou deixe no automático para distribuir por igual.",
        "Copie o bloco CSS, que inclui cor de fallback e a linha com prefixo -webkit-.",
      ],
      faqs: [
        {
          q: "O que acontece se eu deixar a posição de uma parada vazia?",
          a: "Posições vazias são interpoladas pela mesma regra do navegador: a parada cai exatamente entre as vizinhas posicionadas, e as que ficam antes da primeira (ou depois da última) definida se fixam nesse valor.",
        },
        {
          q: "Por que a saída inclui um background-color de fallback?",
          a: "Navegadores antigos sem suporte a gradiente ainda mostram algo razoável: a primeira cor. A linha -webkit- cobre WebKit antigo e a última é a sintaxe padrão que todo navegador moderno suporta.",
        },
        {
          q: "Qual a diferença entre gradiente cônico e linear?",
          a: "O linear varre a caixa em uma direção; o cônico gira em torno de um ponto central como uma pizza, começando no ângulo inicial. Ambos compartilham aqui a mesma lista de paradas.",
        },
      ],
    },
  },
  related: ["contrast-checker", "color-converter", "palette-generator", "color-blindness-simulator", "contrast-text"],
});
