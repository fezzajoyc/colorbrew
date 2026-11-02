import { defineTool } from "../_lib/types";
import { PaletteGeneratorEngine } from "../_engines/palette-generator";

export default defineTool({
  slug: "palette-generator",
  category: "utility",
  icon: "palette",
  engine: { component: PaletteGeneratorEngine, props: {} },
  copy: {
    en: {
      name: "Color Palette Generator",
      h1: "Color palette generator from color-wheel harmonies",
      tagline:
        "Generate five-color palettes from one base color using six color-wheel harmonies, then copy the whole set as CSS variables in one click.",
      intro: [
        "Pick a base color and a harmony — complementary, analogous, triadic, split-complementary, tetradic or monochromatic — and get five swatches built by rotating the base hue around the color wheel, the way art classes have taught color since Goethe.",
        "Every swatch is a real, copyable color. Harmonies with fewer than five hues loop with a +18 lightness lift per round so all five swatches stay distinct, and the whole palette exports as ready-to-paste CSS custom properties.",
      ],
      steps: [
        "Set the base color with the picker or by typing any hex value.",
        "Choose one of the six harmonies; the palette recomputes instantly.",
        "Click a swatch's copy button to grab a single color, or copy all five as CSS variables.",
        "Switch harmonies on the same base to compare moods before committing.",
      ],
      faqs: [
        {
          q: "What is the difference between the harmonies?",
          a: "Complementary takes the hue 180° across the wheel for maximum contrast. Analogous stays within ±60° for calm, tonal sets. Triadic uses 120° steps, split-complementary 150°/210°, tetradic 90° steps, and monochromatic keeps the hue and walks lightness instead.",
        },
        {
          q: "Why does a gray base color produce a gray palette?",
          a: "Gray has zero saturation, and rotating the hue of a color with no saturation changes nothing — that is how color works, not a bug. Give it a saturated base and the harmony reappears immediately.",
        },
        {
          q: "Are these palettes accessible?",
          a: "Harmony alone says nothing about contrast. After picking a palette, run your text/background pairs through the contrast checker — the palette generator and the checker are designed to be used together.",
        },
      ],
    },
    zh: {
      name: "配色生成器",
      h1: "基于色轮和声的配色生成器",
      tagline: "以一个基色通过六种色轮和声生成五色配色方案,一键把整套颜色复制为 CSS 变量。",
      intro: [
        "选一个基色和一种和声——互补、邻近、三色、分裂互补、四色或单色——通过在色轮上旋转基色色相得到五个色块,和美术课教的色彩原理一脉相承。",
        "每个色块都是真实可复制的颜色。色相不足五个的和声按轮次循环并每轮提亮 +18,保证五格各不相同;整套配色可直接导出为 CSS 自定义属性。",
      ],
      steps: [
        "用取色器或输入任意 hex 设定基色。",
        "从六种和声中选一种,配色即时重算。",
        "点色块上的复制按钮取单色,或把五色复制为 CSS 变量。",
        "在同一基色上切换和声,比较不同气质后再定稿。",
      ],
      faqs: [
        {
          q: "六种和声有什么区别?",
          a: "互补取色轮正对面 180° 的色相,对比最强;邻近在 ±60° 内,气质安静;三色每 120° 一档,分裂互补取 150°/210°,四色每 90° 一档;单色不动色相,只走明度阶梯。",
        },
        {
          q: "为什么灰色基色生成的是灰阶配色?",
          a: "灰色的饱和度为零,旋转零饱和度颜色的色相不会有任何变化——这是颜色本身的性质,不是 bug。换一个有饱和度的基色,和声立刻出现。",
        },
        {
          q: "这些配色可达吗?",
          a: "和声本身不保证对比度。选好配色后,把文字/背景组合放进对比度检查器——配色生成器和检查器就是设计成搭配使用的。",
        },
      ],
    },
    ja: {
      name: "カラーパレットジェネレーター",
      h1: "カラーホイールのハーモニーからパレットを生成",
      tagline: "ベースカラー 1 色から 6 種類の色相和声で 5 色のパレットを生成し、ワンクリックで CSS 変数としてコピーできます。",
      intro: [
        "ベースカラーとハーモニー(補色・類似色・トリアッド・スプリット補色・テトラッド・モノクロマティック)を選ぶと、色相環でベースの色相を回転させて 5 つのスウォッチを作ります。色彩の教科書と同じ原理です。",
        "各スウォッチは実際にコピーできる色です。5 色に満たないハーモニーは 1 周ごとに +18 明るくして 5 色を確保し、パレット全体をそのまま貼れる CSS カスタムプロパティとして書き出せます。",
      ],
      steps: [
        "ピッカーまたは HEX 入力でベースカラーを設定。",
        "6 つのハーモニーから選ぶとパレットが即座に再計算されます。",
        "スウォッチのコピーボタンで 1 色ずつ、または 5 色を CSS 変数としてコピー。",
        "同じベースでハーモニーを切り替えて、雰囲気を比べてから決める。",
      ],
      faqs: [
        {
          q: "ハーモニーの違いは何ですか?",
          a: "補色は色相環の正反対(180°)で最も強い対比を作ります。類似色は ±60° 以内で落ち着いたトーン。トリアッドは 120° 刻み、スプリット補色は 150°/210°、テトラッドは 90° 刻み、モノクロマティックは色相を動かさず明度だけで変化させます。",
        },
        {
          q: "グレーのベースからグレーのパレットができるのは?",
          a: "グレーは彩度ゼロで、彩度ゼロの色の色相を回しても何も変わりません。色の性質でありバグではありません。彩度のあるベースを指定すれば和声はすぐに現れます。",
        },
        {
          q: "このパレットはアクセシブルですか?",
          a: "和声だけではコントラストは分かりません。パレットを選んだら、文字と背景の組み合わせをコントラストチェッカーに掛けてください。ジェネレーターとチェッカーは併用する設計です。",
        },
      ],
    },
    es: {
      name: "Generador de paletas de color",
      h1: "Generador de paletas a partir de armonías del círculo cromático",
      tagline:
        "Genera paletas de cinco colores desde un color base con seis armonías del círculo cromático y copia todo el conjunto como variables CSS en un clic.",
      intro: [
        "Elige un color base y una armonía — complementaria, análoga, tríada, complementaria dividida, tétrada o monocromática — y obtén cinco muestras construidas rotando el tono base por el círculo cromático, como llevan enseñando las clases de color desde Goethe.",
        "Cada muestra es un color real y copiable. Las armonías con menos de cinco tonos ciclan con una subida de luminosidad de +18 por vuelta para que las cinco muestras sean distintas, y toda la paleta se exporta como propiedades personalizadas de CSS listas para pegar.",
      ],
      steps: [
        "Fija el color base con el selector o escribiendo cualquier valor hex.",
        "Elige una de las seis armonías; la paleta se recalcula al instante.",
        "Pulsa el botón de copia de una muestra para llevar un color, o copia las cinco como variables CSS.",
        "Cambia de armonía sobre la misma base para comparar estados de ánimo antes de decidir.",
      ],
      faqs: [
        {
          q: "¿En qué se diferencian las armonías?",
          a: "La complementaria toma el tono a 180° en el círculo para máximo contraste. La análoga se queda en ±60° para conjuntos tonales tranquilos. La tríada usa pasos de 120°, la dividida 150°/210°, la tétrada 90°, y la monocromática mantiene el tono y recorre la luminosidad.",
        },
        {
          q: "¿Por qué una base gris produce una paleta gris?",
          a: "El gris tiene saturación cero y rotar el tono de un color sin saturación no cambia nada: así funciona el color, no es un error. Dale una base saturada y la armonía reaparece de inmediato.",
        },
        {
          q: "¿Estas paletas son accesibles?",
          a: "La armonía por sí sola no dice nada del contraste. Tras elegir una paleta, pasa tus pares texto/fondo por el comprobador de contraste: el generador y el comprobador están pensados para usarse juntos.",
        },
      ],
    },
    pt: {
      name: "Gerador de paletas de cores",
      h1: "Gerador de paletas a partir de harmonias do círculo cromático",
      tagline:
        "Gere paletas de cinco cores a partir de uma cor base com seis harmonias do círculo cromático e copie tudo como variáveis CSS num clique.",
      intro: [
        "Escolha uma cor base e uma harmonia — complementar, análoga, tríade, complementar dividida, tétrade ou monocromática — e receba cinco amostras construídas girando o matiz base pelo círculo cromático, como as aulas de cor ensinam desde Goethe.",
        "Cada amostra é uma cor real e copiável. Harmonias com menos de cinco matizes ciclam com um ganho de luminosidade de +18 por volta para que as cinco amostras sejam distintas, e a paleta inteira é exportada como propriedades personalizadas CSS prontas para colar.",
      ],
      steps: [
        "Defina a cor base com o seletor ou digitando qualquer valor hex.",
        "Escolha uma das seis harmonias; a paleta é recalculada na hora.",
        "Clique no botão de copiar de uma amostra para levar uma cor, ou copie as cinco como variáveis CSS.",
        "Troque de harmonia sobre a mesma base para comparar climas antes de decidir.",
      ],
      faqs: [
        {
          q: "Qual a diferença entre as harmonias?",
          a: "A complementar leva o matiz a 180° no círculo para contraste máximo. A análoga fica em ±60° para conjuntos tonais calmos. A tríade usa passos de 120°, a dividida 150°/210°, a tétrade 90°, e a monocromática mantém o matiz e percorre a luminosidade.",
        },
        {
          q: "Por que uma base cinza gera uma paleta cinza?",
          a: "O cinza tem saturação zero e girar o matiz de uma cor sem saturação não muda nada — é assim que a cor funciona, não um bug. Dê uma base saturada e a harmonia reaparece na hora.",
        },
        {
          q: "Essas paletas são acessíveis?",
          a: "Harmonia sozinha nada diz sobre contraste. Depois de escolher uma paleta, passe seus pares de texto/fundo pelo verificador de contraste — o gerador e o verificador foram feitos para ser usados juntos.",
        },
      ],
    },
  },
  related: ["gradient-maker", "contrast-checker", "color-converter", "color-blindness-simulator", "contrast-text"],
});
