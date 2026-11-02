import { defineTool } from "../_lib/types";
import { ContrastTextEngine } from "../_engines/contrast-text";

export default defineTool({
  slug: "contrast-text",
  category: "utility",
  icon: "text",
  engine: { component: ContrastTextEngine, props: {} },
  copy: {
    en: {
      name: "WCAG Text Color Finder",
      h1: "Find text colors that pass WCAG on any background",
      tagline:
        "Given a background color, find the lightest and darkest text colors that clear each WCAG level, plus the stronger of plain white and black.",
      intro: [
        "Instead of guessing grays until one passes, this tool searches for you: on any background it finds the color closest to pure white — and the one closest to pure black — that still clears your WCAG target, by bisecting a white↔black mix until the exact boundary.",
        "That “closest passing” guarantee matters for design: you get the softest gray that is still accessible, not the first heavy-handed one. A custom color field checks any candidate on the spot, and every result shows its measured ratio and a live preview.",
      ],
      steps: [
        "Set the background color you are designing on.",
        "Pick the WCAG target: 3:1 for large text, 4.5:1 for AA, 7:1 for AAA.",
        "Read the lightest and darkest passing text colors and copy either one.",
        "Check a custom text color against the same background for on-the-spot verdicts.",
      ],
      faqs: [
        {
          q: "What does “lightest passing” actually mean?",
          a: "Among all colors on the straight line from pure white to pure black, it is the one nearest to white whose contrast ratio against your background still meets the target. If white itself already passes, white is the answer — no adjustment.",
        },
        {
          q: "When does a level come back as not reachable?",
          a: "When even the far endpoint (pure white or pure black) cannot reach the target on that background — for example, white text at 7:1 on a very light background. The row shows an honest dash instead of a fake color.",
        },
        {
          q: "Why is the search a bisection instead of a formula?",
          a: "The sRGB gamma curve makes luminance a non-linear function of the mix, so the passing threshold has no tidy closed form in hex space. Bisection converges to sub-byte precision in ~30 steps and is provably minimal on its monotonic branch.",
        },
      ],
    },
    zh: {
      name: "WCAG 文字配色器",
      h1: "为任意背景找到达标的文字颜色",
      tagline: "给定背景色,自动找出恰好通过各级 WCAG 的最浅与最深文字色,外加纯白/纯黑谁更强的判断。",
      intro: [
        "不用再凭感觉试灰色:本工具在任意背景上搜索“最接近纯白”和“最接近纯黑”且仍达到 WCAG 目标的文字色——通过对白↔黑混合做二分,精确逼近边界。",
        "“最近达标”的保证对设计很重要:你拿到的是仍可访问的最柔和的灰,而不是第一个死黑的方案。自定义颜色输入框当场判定任意候选色,每个结果都带实测对比度和实时预览。",
      ],
      steps: [
        "设定你正在设计的背景色。",
        "选 WCAG 目标:大字 3:1、AA 4.5:1、AAA 7:1。",
        "读取最浅与最深达标文字色,任意复制。",
        "用自定义输入当场检查候选文字色在同一背景上的表现。",
      ],
      faqs: [
        {
          q: "“最浅达标”到底是什么意思?",
          a: "在纯白到纯黑的直线上,离白色最近、且与背景对比度仍满足目标的那个颜色。如果纯白本身已达标,答案就是纯白——无需调整。",
        },
        {
          q: "什么时候会显示“不可达”?",
          a: "当连远端(纯白或纯黑)在该背景上都达不到目标时——例如浅背景上的白字要 7:1。该行会诚实显示破折号,而不是编一个颜色。",
        },
        {
          q: "为什么用二分搜索而不是公式?",
          a: "sRGB 伽马曲线让亮度对混合系数是非线性的,达标点在 hex 空间没有干净的闭式解。二分约 30 步即可收敛到亚字节精度,且在其单调分支上可证明最小。",
        },
      ],
    },
    ja: {
      name: "WCAG テキストカラーファインダー",
      h1: "どんな背景にも WCAG を満たす文字色を見つける",
      tagline: "背景色を指定すると、各 WCAG レベルを満たす最も明るい色と最も暗い色を自動検索し、純白・純黒のどちらが強いかも判定します。",
      intro: [
        "感覚でグレーを試す代わりに、このツールが検索します。任意の背景で、白↔黒の混合を二分して、WCAG 目標を満たす中で純白に最も近い色(と純黒に最も近い色)を正確に見つけます。",
        "「最も近い合格色」の保証はデザイン上重要です。アクセシブルでありながら最も優しいグレーを取得でき、安直な濃い色に逃げなくて済みます。カスタム入力はその場で判定し、全結果に実測比とプレビューが付きます。",
      ],
      steps: [
        "デザインしている背景色を設定。",
        "WCAG 目標を選択:大きいテキスト 3:1、AA 4.5:1、AAA 7:1。",
        "最も明るい合格色と最も暗い合格色を読み取り、どちらかをコピー。",
        "カスタム欄で任意の文字色を同じ背景に対して即時判定。",
      ],
      faqs: [
        {
          q: "「最も明るい合格色」の正確な意味は?",
          a: "純白から純黒への直線上で、白に最も近く、かつ背景とのコントラスト比が目標を満たす色です。純白自体が合格なら答えは純白——調整は不要です。",
        },
        {
          q: "いつ「到達不能」になりますか?",
          a: "遠端(純白または純黒)ですらその背景で目標に届かないとき——例えば非常に明るい背景で白文字に 7:1 を求める場合。偽の色ではなく正直なダッシュを表示します。",
        },
        {
          q: "公式ではなく二分探索なのはなぜ?",
          a: "sRGB のガンマ曲線により輝度は混合比の非線形関数で、hex 空間にはきれいな閉形式がありません。二分なら約 30 ステップでサブバイト精度に収束し、単調分岐上で最小性が証明できます。",
        },
      ],
    },
    es: {
      name: "Buscador de color de texto WCAG",
      h1: "Encuentra colores de texto que pasen WCAG sobre cualquier fondo",
      tagline:
        "Dado un color de fondo, halla el color de texto más claro y el más oscuro que superan cada nivel WCAG, además del más fuerte entre blanco y negro.",
      intro: [
        "En lugar de probar grises a ciegas hasta que uno pase, esta herramienta busca por ti: sobre cualquier fondo encuentra el color más cercano al blanco puro — y el más cercano al negro puro — que aún cumple tu objetivo WCAG, bisecando una mezcla blanco↔negro hasta la frontera exacta.",
        "Esa garantía de «el más cercano que pasa» importa para el diseño: obtienes el gris más suave que sigue siendo accesible, no el primero que aparece con mano pesada. Un campo de color personalizado comprueba cualquier candidato al momento, y cada resultado muestra su proporción medida y una vista previa en vivo.",
      ],
      steps: [
        "Fija el color de fondo sobre el que diseñas.",
        "Elige el objetivo WCAG: 3:1 para texto grande, 4,5:1 para AA, 7:1 para AAA.",
        "Lee los colores de texto que pasan, el más claro y el más oscuro, y copia cualquiera.",
        "Comprueba un color de texto personalizado sobre el mismo fondo para un veredicto al instante.",
      ],
      faqs: [
        {
          q: "¿Qué significa exactamente «el más claro que pasa»?",
          a: "Entre todos los colores de la recta del blanco puro al negro puro, es el más cercano al blanco cuya relación de contraste con tu fondo aún cumple el objetivo. Si el blanco ya pasa, la respuesta es blanco: sin ajustes.",
        },
        {
          q: "¿Cuándo aparece un nivel como no alcanzable?",
          a: "Cuando ni siquiera el extremo lejano (blanco o negro puro) alcanza el objetivo sobre ese fondo — por ejemplo, texto blanco a 7:1 sobre un fondo muy claro. La fila muestra un guion honesto en vez de un color falso.",
        },
        {
          q: "¿Por qué la búsqueda es una bisección y no una fórmula?",
          a: "La curva gamma de sRGB hace de la luminancia una función no lineal de la mezcla, así que el umbral no tiene forma cerrada limpia en el espacio hex. La bisección converge a precisión sub-byte en ~30 pasos y es demostrablemente mínima en su rama monótona.",
        },
      ],
    },
    pt: {
      name: "Localizador de cor de texto WCAG",
      h1: "Encontre cores de texto que pasam no WCAG em qualquer fundo",
      tagline:
        "Dada uma cor de fundo, encontre a cor de texto mais clara e a mais escura que cumprem cada nível WCAG, além da mais forte entre branco e preto.",
      intro: [
        "Em vez de chutar cinzas até um passar, esta ferramenta busca por você: em qualquer fundo ela encontra a cor mais próxima do branco puro — e a mais próxima do preto puro — que ainda cumpre seu alvo WCAG, por bisseção de uma mistura branco↔preto até a fronteira exata.",
        "Essa garantia de «a mais próxima que passa» importa para o design: você recebe o cinza mais suave que ainda é acessível, não o primeiro exagerado. Um campo de cor personalizada verifica qualquer candidato na hora, e todo resultado mostra a razão medida e uma pré-visualização ao vivo.",
      ],
      steps: [
        "Defina a cor de fundo sobre a qual você está projetando.",
        "Escolha o alvo WCAG: 3:1 para texto grande, 4,5:1 para AA, 7:1 para AAA.",
        "Leia as cores de texto que passam, a mais clara e a mais escura, e copie qualquer uma.",
        "Verifique uma cor de texto personalizada sobre o mesmo fundo para um veredicto imediato.",
      ],
      faqs: [
        {
          q: "O que significa exatamente «a mais clara que passa»?",
          a: "Entre todas as cores da reta do branco puro ao preto puro, é a mais próxima do branco cuja razão de contraste com o seu fundo ainda cumpre o alvo. Se o branco já passa, a resposta é o branco — sem ajuste.",
        },
        {
          q: "Quando um nível aparece como inalcançável?",
          a: "Quando nem o ponto distante (branco ou preto puro) alcança o alvo naquele fundo — por exemplo, texto branco a 7:1 num fundo muito claro. A linha mostra um traço honesto em vez de uma cor falsa.",
        },
        {
          q: "Por que a busca é uma bisseção em vez de uma fórmula?",
          a: "A curva gama do sRGB torna a luminância uma função não linear da mistura, então o limite não tem forma fechada limpa no espaço hex. A bisseção converge para precisão sub-byte em ~30 passos e é comprovadamente mínima em seu ramo monótono.",
        },
      ],
    },
  },
  related: ["gradient-maker", "contrast-checker", "color-converter", "palette-generator", "color-blindness-simulator"],
});
