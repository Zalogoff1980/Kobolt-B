import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import type { Config } from "tailwindcss";

/**
 * Компилирует РЕАЛЬНЫЙ Tailwind CSS (тот же tailwind.config.ts — те же
 * токены цвета/радиусов/шрифтов, что использует всё приложение) под
 * контент КОНКРЕТНОГО HTML, который мы только что вывели через
 * ReactDOMServer для четырёх страниц выпуска.
 *
 * Почему не читать готовый .next/static/css/*.css с диска: тот файл —
 * часть билд-вывода Next.js, гарантированно не входит в файлы,
 * трассируемые в serverless-функцию `/api/pdf` без ручной настройки
 * `outputFileTracingIncludes`, и его имя хешируется при каждой сборке.
 * Прогон Tailwind программно с `content: [{ raw: html }]` — единственный
 * источник CSS, который получает JIT-движок отдельно, гарантированно
 * содержит именно те классы, что реально присутствуют в rendered HTML
 * (включая произвольные значения вроде `h-[150mm]`, `text-[9.5px]`), и
 * не зависит от файловой раскладки билда.
 */
export async function buildTailwindCssForHtml(html: string): Promise<string> {
  const config: Config = {
    content: [{ raw: html, extension: "html" }],
    theme: {
      extend: {
        colors: {
          paper: "#F3EEE3",
          ink: "#161511",
          olive: "#3B3E2D",
          "olive-dim": "#5B5E45",
          accent: "#A8281C",
          chrome: "#EAE4D6",
          stage: "#4A4A42",
        },
        borderRadius: {
          hairline: "2px",
          container: "3px",
          card: "4px",
        },
        fontFamily: {
          display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
          body: ["var(--font-body)", "Arial", "sans-serif"],
        },
      },
    },
    corePlugins: {
      // preflight (Tailwind base reset) is applied separately via the
      // hand-written print base CSS in renderIssueHtml.ts, so it isn't
      // duplicated here.
      preflight: false,
    },
    plugins: [],
  };

  // Тот же .kobolt-page (бумажная фактура), что и styles/globals.css —
  // preflight отключён, поэтому этот единственный не-utility класс,
  // используемый разметкой (PageFrame), нужно продублировать здесь
  // явно: JIT-сканирование content видит только utility-подобные
  // имена классов, а не произвольные кастомные CSS-правила.
  const source = `@tailwind base;
@tailwind components;
@tailwind utilities;
.kobolt-page {
  background-color: theme("colors.paper");
  background-image:
    radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 55%, rgba(22, 21, 17, 0.05) 100%),
    repeating-linear-gradient(
      115deg,
      rgba(22, 21, 17, 0.02) 0px,
      rgba(22, 21, 17, 0.02) 1px,
      transparent 1px,
      transparent 3px
    );
}`;

  const result = await postcss([tailwindcss(config), autoprefixer]).process(source, {
    from: undefined,
  });
  return result.css;
}
