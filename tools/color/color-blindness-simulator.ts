import { defineTool } from "../_lib/types";
import { ColorBlindnessSimulatorEngine } from "../_engines/color-blindness-simulator";

export default defineTool({
  slug: "color-blindness-simulator",
  category: "utility",
  icon: "image",
  engine: { component: ColorBlindnessSimulatorEngine, props: {} },
  copy: {
    en: {
      name: "Color Blindness Simulator",
      h1: "Color blindness simulator for images and colors",
      tagline:
        "Simulate protanopia, deuteranopia and tritanopia on any image or color with the Viénot 1999 model, compare all three side by side, download PNGs.",
      intro: [
        "Roughly 1 in 12 men and 1 in 200 women have some form of color-vision deficiency. This simulator shows how your image or color reads through the three dichromat conditions — protanopia (red-blind), deuteranopia (green-blind) and tritanopia (blue-blind) — so you can catch red-on-green charts and link colors that vanish before shipping.",
        "The math is the Viénot, Brettel & Mollon (1999) transformation applied in linear RGB, the standard reference implementation used across color-vision research. Simulation runs entirely in your browser: images are processed pixel-by-pixel on a canvas and never uploaded anywhere.",
      ],
      steps: [
        "Choose the solid-color demo for a quick swatch check, or switch to image and drop a PNG/JPG.",
        "Compare the original against protanopia, deuteranopia and tritanopia, side by side.",
        "Look for pairs that collapse into the same simulated color — those will confuse readers.",
        "Download any panel as a PNG for design reviews or accessibility reports.",
      ],
      faqs: [
        {
          q: "Which simulation model do you use?",
          a: "The Viénot–Brettel–Mollon (1999) dichromat model applied to linearized RGB. It reproduces the confusion lines of dichromatic vision and is the standard cited method; simpler RGB-channel tricks found online do not match measured perception.",
        },
        {
          q: "Why does my grayscale image come back unchanged?",
          a: "Each row of the transformation matrix sums to 1, so neutral grays map onto themselves — a mathematical property of the model, and a useful sanity check that the simulation is honest.",
        },
        {
          q: "Is this a medical tool?",
          a: "No. It approximates how dichromats perceive color so designers can test interfaces, charts and art. It is not a diagnosis and says nothing about your own vision.",
        },
      ],
    },
    zh: {
      name: "色盲模拟器",
      h1: "图片与颜色的色盲模拟器",
      tagline: "用 Viénot 1999 模型在任意图片或颜色上模拟红色盲、绿色盲、蓝色盲三种色觉,并排对比,一键下载 PNG。",
      intro: [
        "约每 12 名男性和每 200 名女性中就有一人存在色觉障碍。本模拟器展示你的图片或颜色在三种二色视——红色盲(protanopia)、绿色盲(deuteranopia)、蓝色盲(tritanopia)——下的观感,在上线前抓住会消失的红绿图表和链接色。",
        "算法是 Viénot、Brettel 与 Mollon(1999)在线性 RGB 上的变换矩阵,色觉研究领域的标准参考实现。模拟完全在你的浏览器中进行:图片按像素在 canvas 上处理,绝不上传。",
      ],
      steps: [
        "纯色样张适合快速检查色块;或切到图片模式,拖入 PNG/JPG。",
        "原图与三种模拟并排对比。",
        "找出在模拟中坍缩成同色的配色——这些会让读者混淆。",
        "把任意面板下载为 PNG,用于设计评审或无障碍报告。",
      ],
      faqs: [
        {
          q: "用的什么模拟模型?",
          a: "Viénot–Brettel–Mollon(1999)二色视模型,作用于线性化 RGB。它再现二色视的混淆线,是被广泛引用的标准方法;网上那些直接动 RGB 通道的技巧与实测感知并不相符。",
        },
        {
          q: "为什么灰度图模拟后没有变化?",
          a: "变换矩阵每一行的和都是 1,中性灰映射到自身——这是模型的数学性质,也是检验模拟是否诚实的哨兵。",
        },
        {
          q: "这是医疗工具吗?",
          a: "不是。它近似二色视者对颜色的感知,供设计师测试界面、图表与作品;不构成诊断,也不反映你自己的色觉。",
        },
      ],
    },
    ja: {
      name: "色覚シミュレーター",
      h1: "画像とカラーの色覚シミュレーター",
      tagline: "Viénot 1999 モデルで画像や色に 1 型・2 型・3 型色覚をシミュレートし、3 種類を並べて比較、PNG でダウンロードできます。",
      intro: [
        "男性の約 12 人に 1 人、女性の約 200 人に 1 人は何らかの色覚特性を持ちます。このシミュレーターは、画像や色が 1 型(protanopia)・2 型(deuteranopia)・3 型(tritanopia)の 2 色型色覚を通してどう見えるかを表示し、リリース前に消えるリンク色や赤緑のグラフを見つけられます。",
        "計算は Viénot・Brettel・Mollon(1999)の変換をリニア RGB に適用したもので、色覚研究の標準的な参考実装です。シミュレーションは完全にブラウザー内で実行され、画像は canvas 上でピクセルごとに処理され、どこにも送信されません。",
      ],
      steps: [
        "単色サンプルで手早く確認するか、画像モードに切り替えて PNG/JPG をドロップ。",
        "元画像と 1 型・2 型・3 型の 3 種類を並べて比較。",
        "シミュレート後に同色に潰れる組み合わせを探す——そこが読者の混乱点です。",
        "任意のパネルを PNG でダウンロードし、デザインレビューやアクセシビリティ報告に使う。",
      ],
      faqs: [
        {
          q: "どのシミュレーション模型を使っていますか?",
          a: "Viénot–Brettel–Mollon(1999)の 2 色型モデルをリニア化した RGB に適用したものです。2 色型色覚の混同線を再現し、引用される標準手法です。ネット上の RGB チャンネルをいじる手抜き実装は実測の知覚と一致しません。",
        },
        {
          q: "グレースケール画像が変わらないのは?",
          a: "変換行列の各行の和は 1 なので、ニュートラルなグレーは自分自身に写像されます。モデルの数学的性質であり、シミュレーションが誠実かの健全性チェックにもなります。",
        },
        {
          q: "医療ツールですか?",
          a: "いいえ。2 色型色覚の人が色をどう知覚するかを近似し、デザインナーや開発者が UI・グラフ・作品を検証するためのものです。診断ではなく、あなた自身の色覚については何も述べません。",
        },
      ],
    },
    es: {
      name: "Simulador de daltonismo",
      h1: "Simulador de daltonismo para imágenes y colores",
      tagline:
        "Simula protanopía, deuteranopía y tritanopía sobre cualquier imagen o color con el modelo de Viénot 1999, compara las tres y descarga PNGs.",
      intro: [
        "Aproximadamente 1 de cada 12 hombres y 1 de cada 200 mujeres tiene alguna deficiencia de la visión del color. Este simulador muestra cómo se ve tu imagen o color con las tres condiciones de dicromatismo — protanopía (ciego al rojo), deuteranopía (al verde) y tritanopía (al azul) — para cazar gráficos rojo-sobre-verde y colores de enlace que desaparecen antes de publicar.",
        "La matemática es la transformación de Viénot, Brettel y Mollon (1999) aplicada en RGB lineal, la implementación de referencia estándar en investigación de visión cromática. Todo se ejecuta en tu navegador: las imágenes se procesan píxel a píxel en un canvas y nunca se suben a ningún sitio.",
      ],
      steps: [
        "Usa la muestra de color sólido para una comprobación rápida, o cambia a imagen y suelta un PNG/JPG.",
        "Compara el original con protanopía, deuteranopía y tritanopía, lado a lado.",
        "Busca pares que colapsan en el mismo color simulado: esos confundirán a tus lectores.",
        "Descarga cualquier panel como PNG para revisiones de diseño o informes de accesibilidad.",
      ],
      faqs: [
        {
          q: "¿Qué modelo de simulación usáis?",
          a: "El modelo de dicromatismo de Viénot–Brettel–Mollon (1999) aplicado al RGB linealizado. Reproduce las líneas de confusión de la visión dicromática y es el método estándar citado; los trucos con canales RGB que circulan por internet no coinciden con la percepción medida.",
        },
        {
          q: "¿Por qué mi imagen en escala de grises sale igual?",
          a: "Cada fila de la matriz de transformación suma 1, así que los grises neutros se mapean a sí mismos: una propiedad matemática del modelo, y una comprobación útil de que la simulación es honesta.",
        },
        {
          q: "¿Es una herramienta médica?",
          a: "No. Aproxima cómo perciben el color las personas dicrómatas para que diseñadores prueben interfaces, gráficos y obras. No es un diagnóstico ni dice nada sobre tu propia visión.",
        },
      ],
    },
    pt: {
      name: "Simulador de daltonismo",
      h1: "Simulador de daltonismo para imagens e cores",
      tagline:
        "Simule protanopia, deuteranopia e tritanopia em qualquer imagem ou cor com o modelo de Viénot 1999, compare as três e baixe PNGs.",
      intro: [
        "Cerca de 1 em cada 12 homens e 1 em cada 200 mulheres tem alguma deficiência na visão de cores. Este simulador mostra como sua imagem ou cor fica sob as três condições de dicromatismo — protanopia (cego ao vermelho), deuteranopia (ao verde) e tritanopia (ao azul) — para caçar gráficos verde-sobre-vermelho e cores de link que desaparecem antes de publicar.",
        "A matemática é a transformação de Viénot, Brettel e Mollon (1999) aplicada em RGB linear, a implementação de referência padrão na pesquisa de visão cromática. Tudo roda no seu navegador: as imagens são processadas pixel a pixel num canvas e nunca enviadas a lugar algum.",
      ],
      steps: [
        "Use a amostra de cor sólida para uma checagem rápida, ou mude para imagem e solte um PNG/JPG.",
        "Compare o original com protanopia, deuteranopia e tritanopia, lado a lado.",
        "Procure pares que colapsam na mesma cor simulada — esses vão confundir os leitores.",
        "Baixe qualquer painel como PNG para revisões de design ou relatórios de acessibilidade.",
      ],
      faqs: [
        {
          q: "Qual modelo de simulação vocês usam?",
          a: "O modelo de dicromatismo de Viénot–Brettel–Mollon (1999) aplicado ao RGB linearizado. Ele reproduz as linhas de confusão da visão dicromática e é o método padrão citado; os truques com canais RGB que circulam na internet não correspondem à percepção medida.",
        },
        {
          q: "Por que minha imagem em tons de cinza sai igual?",
          a: "Cada linha da matriz de transformação soma 1, então os cinzas neutros se mapeiam neles mesmos — uma propriedade matemática do modelo e uma checagem útil de que a simulação é honesta.",
        },
        {
          q: "É uma ferramenta médica?",
          a: "Não. Ela aproxima como dícromas percebem as cores para que designers testem interfaces, gráficos e obras. Não é um diagnóstico e não diz nada sobre a sua própria visão.",
        },
      ],
    },
  },
  related: ["gradient-maker", "contrast-checker", "color-converter", "palette-generator", "contrast-text"],
});
