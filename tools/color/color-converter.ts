import { defineTool } from "../_lib/types";
import { ColorConverterEngine } from "../_engines/color-converter";

export default defineTool({
  slug: "color-converter",
  category: "utility",
  icon: "swap",
  engine: { component: ColorConverterEngine, props: {} },
  copy: {
    en: {
      name: "Color Converter",
      h1: "HEX, RGB, HSL and OKLCH color converter",
      tagline:
        "Convert any color between HEX, RGB, HSL and OKLCH with four-way live sync — edit one format and the others update instantly, each ready to copy.",
      intro: [
        "Paste a color in any format this site understands — #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) or oklch(0.541 0.247 293) — and all four rows show the same color at once. Edit any row and the others re-render live.",
        "OKLCH is computed with Björn Ottosson's standard OKLab matrices, the same math behind the CSS Color 4 specification, so the numbers you copy match what browsers produce. Colors with alpha are rejected instead of silently flattened: a converter that pretends rgba(0,0,0,0.5) is a solid color would lie to you.",
      ],
      steps: [
        "Paste or pick a color — the detected format is shown next to the swatch.",
        "Edit any of the four rows (HEX, RGB, HSL, OKLCH); the rest stay in sync.",
        "Copy a single row with its button, or copy the hex you need for CSS.",
        "Nudge the native color picker for visual exploration; every row follows.",
      ],
      faqs: [
        {
          q: "Why does my color change slightly after round-tripping between formats?",
          a: "HEX and RGB store 8-bit channels (integers 0–255), while HSL and OKLCH are continuous spaces. Converting back can land half a bit off — a difference of at most 1/255 per channel, invisible in practice.",
        },
        {
          q: "Is OKLCH supported in browsers?",
          a: "All evergreen browsers support oklch() in CSS since 2023. It is perceptually uniform — equal steps look equally different — which makes it the best space for building scales and palettes by hand.",
        },
        {
          q: "Why do you reject colors with alpha?",
          a: "Because flattening needs a background to composite onto, and any answer would be arbitrary. This tool converts solid colors; for alpha, composite the color over your real background first, then convert the result.",
        },
      ],
    },
    zh: {
      name: "颜色转换器",
      h1: "HEX、RGB、HSL、OKLCH 颜色转换",
      tagline: "在 HEX、RGB、HSL、OKLCH 四种格式间实时互转——改任意一行其余同步更新,每行都能一键复制。",
      intro: [
        "粘贴任意本站支持的格式——#7C3AED、rgb(124 58 237)、hsl(262, 83%, 58%) 或 oklch(0.541 0.247 293)——四行同时显示同一颜色,改任意一行其余实时跟随。",
        "OKLCH 用 Björn Ottosson 的标准 OKLab 矩阵计算,与 CSS Color 4 规范同一套数学,复制出的数字和浏览器产出的完全一致。带透明度的颜色会被拒绝而不是静默压平——假装 rgba(0,0,0,0.5) 是实色的转换器在骗你。",
      ],
      steps: [
        "粘贴或取色——色样旁显示识别出的格式。",
        "编辑四行中的任意一行(HEX、RGB、HSL、OKLCH),其余行保持同步。",
        "用每行的按钮单独复制,或复制 CSS 需要的 hex。",
        "拖动原生取色器做视觉探索,四行实时跟随。",
      ],
      faqs: [
        {
          q: "为什么颜色在格式间往返后会有细微变化?",
          a: "HEX 和 RGB 存 8 位整数通道(0–255),而 HSL 和 OKLCH 是连续空间,转回去可能差半个位——每通道最多 1/255,实际看不出来。",
        },
        {
          q: "浏览器支持 OKLCH 吗?",
          a: "2023 年起所有常青浏览器都在 CSS 中支持 oklch()。它是感知均匀的色彩空间——等步长看起来差异相等——是手工构建色阶和调色板的最佳空间。",
        },
        {
          q: "为什么拒绝带透明度的颜色?",
          a: "因为压平需要一个背景色来合成,任何选择都武断。本工具只转换实色;遇到透明度,先把它合成到真实背景上,再转换结果。",
        },
      ],
    },
    ja: {
      name: "カラーコンバーター",
      h1: "HEX・RGB・HSL・OKLCH カラー変換",
      tagline: "HEX・RGB・HSL・OKLCH の 4 形式をリアルタイム相互変換。どれか 1 行を編集すると他も即時更新され、それぞれコピーできます。",
      intro: [
        "このサイトが扱える任意の形式で色を貼り付けてください(#7C3AED、rgb(124 58 237)、hsl(262, 83%, 58%)、oklch(0.541 0.247 293) など)。4 行すべてに同じ色が表示され、どれを編集しても他がリアルタイムに追従します。",
        "OKLCH は Björn Ottosson 標準の OKLab 行列で計算しており、CSS Color 4 仕様と同じ数学です。コピーした数値はブラウザーの出力と一致します。アルファ付きの色は黙って合成せず拒否します。rgba(0,0,0,0.5) を実色と偽るコンバーターは嘘をついているのと同じです。",
      ],
      steps: [
        "色を貼り付けまたは抽出——スウォッチの横に判定形式が表示されます。",
        "4 行のどれか(HEX・RGB・HSL・OKLCH)を編集。他の行は同期します。",
        "各行のボタンで 1 行ずつコピー、または CSS 用の hex をコピー。",
        "ネイティブのカラーピッカーで視覚的に探索。全行が追従します。",
      ],
      faqs: [
        {
          q: "形式を往復すると色が少し変わるのはなぜ?",
          a: "HEX と RGB は 8 ビット整数チャンネル(0–255)、HSL と OKLCH は連続空間です。変換して戻すと最大半ビットずれることがあり、各チャンネルで最大 1/255——実用上は見分けがつきません。",
        },
        {
          q: "ブラウザーは OKLCH に対応している?",
          a: "2023 年からすべてのエバーグリーンブラウザーが CSS の oklch() に対応しています。知覚的に均一で、等間隔が等しい差に見えるため、スケールやパレットを手作りするのに最適な空間です。",
        },
        {
          q: "アルファ付きの色を拒否するのはなぜ?",
          a: "平面化には合成先の背景が必要で、どれを選んでも恣意的になるからです。このツールは実色だけを変換します。アルファがある場合はまず実際の背景に合成してから結果を変換してください。",
        },
      ],
    },
    es: {
      name: "Convertidor de colores",
      h1: "Convertidor de colores HEX, RGB, HSL y OKLCH",
      tagline:
        "Convierte cualquier color entre HEX, RGB, HSL y OKLCH con sincronización en vivo de cuatro vías: edita un formato y los demás se actualizan al instante.",
      intro: [
        "Pega un color en cualquier formato que este sitio entienda — #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) u oklch(0.541 0.247 293) — y las cuatro filas mostrarán el mismo color a la vez. Edita una y las demás se re-renderizan en vivo.",
        "OKLCH se calcula con las matrices estándar OKLab de Björn Ottosson, la misma matemática de la especificación CSS Color 4, así que los números que copias coinciden con los de los navegadores. Los colores con alfa se rechazan en vez de aplanarse en silencio: un convertidor que finge que rgba(0,0,0,0.5) es un color sólido te miente.",
      ],
      steps: [
        "Pega o elige un color: el formato detectado aparece junto a la muestra.",
        "Edita cualquiera de las cuatro filas (HEX, RGB, HSL, OKLCH); las demás se sincronizan.",
        "Copia una fila con su botón, o copia el hex que necesitas para CSS.",
        "Mueve el selector nativo para explorar visualmente; todas las filas lo siguen.",
      ],
      faqs: [
        {
          q: "¿Por qué mi color cambia ligeramente al ir y volver entre formatos?",
          a: "HEX y RGB almacenan canales de 8 bits (enteros 0–255), mientras que HSL y OKLCH son espacios continuos. Al convertir de vuelta puede quedar medio bit de diferencia — 1/255 por canal como máximo, invisible en la práctica.",
        },
        {
          q: "¿Los navegadores soportan OKLCH?",
          a: "Todos los navegadores evergreen soportan oklch() en CSS desde 2023. Es perceptualmente uniforme — pasos iguales se ven igual de distintos — lo que lo hace ideal para construir escalas y paletas a mano.",
        },
        {
          q: "¿Por qué rechazáis colores con alfa?",
          a: "Porque aplanar exige un fondo sobre el que componer, y cualquier respuesta sería arbitraria. Esta herramienta convierte colores sólidos; con alfa, compón primero sobre tu fondo real y convierte el resultado.",
        },
      ],
    },
    pt: {
      name: "Conversor de cores",
      h1: "Conversor de cores HEX, RGB, HSL e OKLCH",
      tagline:
        "Converta qualquer cor entre HEX, RGB, HSL e OKLCH com sincronização ao vivo em quatro vias — edite um formato e os outros atualizam na hora.",
      intro: [
        "Cole uma cor em qualquer formato que o site entenda — #7C3AED, rgb(124 58 237), hsl(262, 83%, 58%) ou oklch(0.541 0.247 293) — e as quatro linhas mostram a mesma cor de uma vez. Edite qualquer linha e as outras se atualizam ao vivo.",
        "OKLCH é calculado com as matrizes OKLab padrão de Björn Ottosson, a mesma matemática da especificação CSS Color 4, então os números que você copia coincidem com os dos navegadores. Cores com alfa são rejeitadas em vez de achatadas em silêncio: um conversor que finge que rgba(0,0,0,0.5) é uma cor sólida está mentindo para você.",
      ],
      steps: [
        "Cole ou escolha uma cor — o formato detectado aparece ao lado da amostra.",
        "Edite qualquer uma das quatro linhas (HEX, RGB, HSL, OKLCH); as demais ficam em sincronia.",
        "Copie uma linha com o botão dela, ou copie o hex de que precisa para CSS.",
        "Mexa no seletor nativo para explorar visualmente; todas as linhas o seguem.",
      ],
      faqs: [
        {
          q: "Por que minha cor muda um pouco ao ir e voltar entre formatos?",
          a: "HEX e RGB guardam canais de 8 bits (inteiros 0–255), enquanto HSL e OKLCH são espaços contínuos. Converter de volta pode parar meio bit fora — no máximo 1/255 por canal, invisível na prática.",
        },
        {
          q: "Os navegadores suportam OKLCH?",
          a: "Todos os navegadores evergreen suportam oklch() no CSS desde 2023. É perceptualmente uniforme — passos iguais parecem igualmente diferentes — o que o torna o melhor espaço para criar escalas e paletas à mão.",
        },
        {
          q: "Por que vocês rejeitam cores com alfa?",
          a: "Porque achatar exige um fundo para compor, e qualquer resposta seria arbitrária. Esta ferramenta converte cores sólidas; com alfa, componha primeiro sobre o seu fundo real e converta o resultado.",
        },
      ],
    },
  },
  related: ["gradient-maker", "contrast-checker", "palette-generator", "color-blindness-simulator", "contrast-text"],
});
