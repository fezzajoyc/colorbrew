import { defineTool } from "../_lib/types";
import { ContrastCheckerEngine } from "../_engines/contrast-checker";

export default defineTool({
  slug: "contrast-checker",
  category: "utility",
  icon: "check",
  featured: true,
  engine: { component: ContrastCheckerEngine, props: {} },
  copy: {
    en: {
      name: "WCAG Contrast Checker",
      h1: "WCAG color contrast checker (AA / AAA)",
      tagline:
        "Check the contrast ratio between two colors against WCAG 2.x AA and AAA thresholds, with pass/fail badges and a live text sample.",
      intro: [
        "This checker computes the WCAG 2.x contrast ratio between a text color and a background color and tells you, honestly, where it passes and where it fails: 4.5:1 for AA normal text, 7:1 for AAA normal text, 3:1 and 4.5:1 for large text.",
        "The ratio is the full-precision value from the WCAG formula — badges are judged before any rounding, so a 4.4996:1 color is reported as a fail, not flattered into a pass. The live sample shows real text at three sizes on your exact pair of colors.",
      ],
      steps: [
        "Set the text color and the background color (picker or any hex, rgb() or rgba() string).",
        "Read the ratio and the four AA/AAA badges for normal and large text.",
        "Check the sample preview at 26 px bold, 15 px and 12 px to see how it feels.",
        "Swap the two colors to test the inverse pair, or reset to start over.",
      ],
      faqs: [
        {
          q: "How is the contrast ratio calculated?",
          a: "Per WCAG 2.x: both colors are linearized from sRGB, their relative luminance is computed with the standard 0.2126/0.7152/0.0722 weighting, and the ratio is (lighter + 0.05) / (darker + 0.05). Values run from 1:1 (identical) to 21:1 (black on white).",
        },
        {
          q: "What counts as “large text”?",
          a: "WCAG defines large text as at least 18 pt (24 px), or at least 14 pt (18.7 px) bold. Large text has lower thresholds: 3:1 for AA and 4.5:1 for AAA, because bigger glyphs are easier to read at lower contrast.",
        },
        {
          q: "What happens with semi-transparent colors?",
          a: "A color with alpha is flattened onto white the same way CSS composites it (channel = color·a + 255·(1−a)) before the ratio is computed, so what you measure is what actually renders on a white page.",
        },
      ],
    },
    zh: {
      name: "WCAG 对比度检查器",
      h1: "WCAG 颜色对比度检查器(AA / AAA)",
      tagline: "按 WCAG 2.x 的 AA 与 AAA 阈值计算两色对比度,给出四级达标判定,并附实时文字样张预览。",
      intro: [
        "计算文字色与背景色的 WCAG 2.x 对比度,如实告诉你哪些档位达标、哪些不达标:正文 AA 4.5:1、AAA 7:1,大字 3:1 与 4.5:1。",
        "对比度是 WCAG 公式的全精度值——判定在任何舍入之前进行,4.4996:1 就是不达标,不会被舍成 4.5 蒙混过关。样张在你的真实配色上按三种字号渲染实际文字。",
      ],
      steps: [
        "设置文字色与背景色(取色器,或任意 hex、rgb()、rgba() 字符串)。",
        "读取对比度与四级 AA/AAA 判定。",
        "在 26px 加粗、15px、12px 三档样张上确认实际观感。",
        "交换两色测试反色组合,或重置重来。",
      ],
      faqs: [
        {
          q: "对比度是怎么算的?",
          a: "按 WCAG 2.x:两色从 sRGB 线性化后,用 0.2126/0.7152/0.0722 标准权重计算相对亮度,对比度 = (较亮 + 0.05) / (较暗 + 0.05)。范围从 1:1(相同)到 21:1(白底黑字)。",
        },
        {
          q: "什么算“大字”?",
          a: "WCAG 定义大字为至少 18pt(24px),或至少 14pt(18.7px)加粗。大字阈值更低:AA 3:1、AAA 4.5:1,因为更大的字形在更低对比度下也可读。",
        },
        {
          q: "半透明颜色怎么处理?",
          a: "带透明度的颜色先按 CSS 合成规则压平到白底(通道 = 颜色·a + 255·(1−a))再算对比度,量出来的就是白底页面上的实际效果。",
        },
      ],
    },
    ja: {
      name: "WCAG コントラストチェッカー",
      h1: "WCAG カラーコントラストチェッカー(AA / AAA)",
      tagline: "2 色のコントラスト比を WCAG 2.x の AA・AAA しきい値で判定し、合格/不合格バッジと実際のテキストサンプルを表示します。",
      intro: [
        "文字色と背景色の WCAG 2.x コントラスト比を計算し、どの等級に合格するかを正直に示します。標準テキストは AA 4.5:1・AAA 7:1、大きいテキストは 3:1 と 4.5:1。",
        "比率は WCAG の全精度の値です。判定は丸めの前に行われるため、4.4996:1 は合格とごまかされず不合格と表示されます。サンプルは実際の 2 色で 3 サイズの文字を描画します。",
      ],
      steps: [
        "文字色と背景色を設定(ピッカー、または hex・rgb()・rgba() 文字列)。",
        "比率と通常・大きいテキストの 4 つの AA/AAA バッジを読み取る。",
        "26px 太字・15px・12px のサンプルで実際の見え方を確認。",
        "2 色を入れ替えて逆の組み合わせを試すか、リセットしてやり直す。",
      ],
      faqs: [
        {
          q: "コントラスト比はどう計算する?",
          a: "WCAG 2.x に従い、両色を sRGB からリニア化し、0.2126/0.7152/0.0722 の標準重みで相対輝度を求め、比率 = (明るい + 0.05) / (暗い + 0.05)。範囲は 1:1(同一)から 21:1(白地に黒)です。",
        },
        {
          q: "「大きいテキスト」の定義は?",
          a: "WCAG では 18pt(24px)以上、または 14pt(18.7px)以上の太字を大きいテキストと呼びます。しきい値は緩く AA 3:1・AAA 4.5:1 です。大きな字形は低コントラストでも読みやすいためです。",
        },
        {
          q: "半透明の色はどう扱う?",
          a: "アルファ付きの色は CSS と同じ合成則(チャンネル = 色·a + 255·(1−a))で白に平面化してから比率を計算します。つまり白いページで実際に表示される色を測定します。",
        },
      ],
    },
    es: {
      name: "Comprobador de contraste WCAG",
      h1: "Comprobador de contraste de color WCAG (AA / AAA)",
      tagline:
        "Calcula la relación de contraste entre dos colores según los umbrales WCAG 2.x AA y AAA, con insignias de aprobación y una muestra de texto en vivo.",
      intro: [
        "Este comprobador calcula la relación de contraste WCAG 2.x entre un color de texto y un fondo, y te dice con honestidad dónde pasa y dónde no: 4,5:1 para AA en texto normal, 7:1 para AAA, 3:1 y 4,5:1 para texto grande.",
        "La relación es el valor de precisión completa de la fórmula WCAG: las insignias se juzgan antes de cualquier redondeo, así que un 4,4996:1 se informa como fallo, no se maquilla hasta aprobar. La muestra muestra texto real en tres tamaños sobre tus colores exactos.",
      ],
      steps: [
        "Fija el color del texto y el fondo (selector o cualquier cadena hex, rgb() o rgba()).",
        "Lee la relación y las cuatro insignias AA/AAA para texto normal y grande.",
        "Comprueba la muestra a 26 px en negrita, 15 px y 12 px para valorar el resultado.",
        "Intercambia ambos colores para probar el par inverso o restablece y empieza de nuevo.",
      ],
      faqs: [
        {
          q: "¿Cómo se calcula la relación de contraste?",
          a: "Según WCAG 2.x: ambos colores se linealizan desde sRGB, su luminancia relativa se calcula con la ponderación estándar 0,2126/0,7152/0,0722 y la relación es (más claro + 0,05) / (más oscuro + 0,05). Va de 1:1 (idénticos) a 21:1 (negro sobre blanco).",
        },
        {
          q: "¿Qué cuenta como “texto grande”?",
          a: "WCAG define texto grande como al menos 18 pt (24 px) o al menos 14 pt (18,7 px) en negrita. Sus umbrales son menores —3:1 para AA y 4,5:1 para AAA— porque los glifos grandes se leen mejor con menos contraste.",
        },
        {
          q: "¿Qué ocurre con los colores semitransparentes?",
          a: "Un color con alfa se aplana sobre blanco igual que lo compone CSS (canal = color·a + 255·(1−a)) antes de calcular la relación, de modo que mides lo que realmente se renderiza en una página blanca.",
        },
      ],
    },
    pt: {
      name: "Verificador de contraste WCAG",
      h1: "Verificador de contraste de cor WCAG (AA / AAA)",
      tagline:
        "Calcule a razão de contraste entre duas cores segundo os limiares WCAG 2.x AA e AAA, com selos de aprovação e uma amostra de texto ao vivo.",
      intro: [
        "Este verificador calcula a razão de contraste WCAG 2.x entre uma cor de texto e um fundo e diz com honestidade onde passa e onde falha: 4,5:1 para AA em texto normal, 7:1 para AAA, 3:1 e 4,5:1 para texto grande.",
        "A razão é o valor de precisão total da fórmula WCAG — os selos são julgados antes de qualquer arredondamento, então um 4,4996:1 é reportado como falha, não embelezado até passar. A amostra mostra texto real em três tamanhos sobre o seu par exato de cores.",
      ],
      steps: [
        "Defina a cor do texto e a do fundo (seletor ou qualquer string hex, rgb() ou rgba()).",
        "Leia a razão e os quatro selos AA/AAA para texto normal e grande.",
        "Confira a amostra a 26 px em negrito, 15 px e 12 px para avaliar o resultado.",
        "Troque as duas cores para testar o par inverso ou redefina e comece de novo.",
      ],
      faqs: [
        {
          q: "Como a razão de contraste é calculada?",
          a: "Conforme WCAG 2.x: ambas as cores são linearizadas do sRGB, a luminância relativa usa a ponderação padrão 0,2126/0,7152/0,0722 e a razão é (mais claro + 0,05) / (mais escuro + 0,05). Vai de 1:1 (idênticas) a 21:1 (preto no branco).",
        },
        {
          q: "O que conta como “texto grande”?",
          a: "A WCAG define texto grande como pelo menos 18 pt (24 px) ou pelo menos 14 pt (18,7 px) em negrito. Os limiares são menores — 3:1 para AA e 4,5:1 para AAA — porque glifos maiores são legíveis com menos contraste.",
        },
        {
          q: "O que acontece com cores semitransparentes?",
          a: "Uma cor com alfa é achatada sobre o branco do mesmo jeito que o CSS a compõe (canal = cor·a + 255·(1−a)) antes do cálculo, então você mede o que realmente aparece numa página branca.",
        },
      ],
    },
  },
  related: ["gradient-maker", "color-converter", "palette-generator", "color-blindness-simulator", "contrast-text"],
});
