import { Issue } from "@/lib/content/issue";
import { A4Page } from "@/components/canvas/A4Page";
import { buildTailwindCssForHtml } from "./buildTailwindCss";
import { getEmbeddedFontCss } from "./googleFonts";
import { inlineEngravingImages } from "./inlineStaticImages";

/**
 * Единственное место, которое превращает Issue в HTML-документ для
 * Puppeteer. Использует ТОТ ЖЕ `A4Page`, что и живой Preview
 * (components/canvas/A4Page.tsx) — никакой отдельной "версии для
 * печати" нет, ровно как того требует ТЗ (п.3): и preview, и PDF —
 * один и тот же React-рендерер, различается только то, что его
 * оборачивает (масштабирующий div на экране vs `@page`-разметка здесь).
 *
 * Четыре страницы рендерятся В ОДИН HTML-документ друг за другом с
 * `page-break-after: always` на всех, кроме последней — это даёт
 * Puppeteer'у ровно 4 физические страницы за ОДИН вызов page.pdf(),
 * без склейки нескольких PDF через отдельную библиотеку и без риска
 * лишней 5-й пустой страницы.
 */
export async function renderIssueHtml(issue: Issue): Promise<string> {
  // Динамический import(), а не статический `import ... from
  // "react-dom/server"` вверху файла: Next.js App Router статически
  // анализирует граф модулей под app/ и lib/ и жёстко запрещает
  // ЛЮБОЙ статический импорт react-dom/server где бы то ни было в
  // этом дереве ("You're importing a component that imports
  // react-dom/server...") — это ограничение относится и к обычным
  // Route Handler'ам, не только к клиентским компонентам. Реальная
  // сборка на Vercel упала именно на этом (см. build log). Динамический
  // import(), выполняемый только в рантайме внутри функции, не виден
  // статическому трассировщику Next — стандартный обход для случаев
  // "SSR внутри Route Handler" (PDF/email-рендер и т.п.).
  const { renderToStaticMarkup } = await import("react-dom/server");

  const rawPagesMarkup = ([1, 2, 3, 4] as const)
    .map((n, i) => {
      const inner = renderToStaticMarkup(<A4Page issue={issue} pageNumber={n} />);
      const isLast = i === 3;
      return `<div class="pdf-page-wrap"${isLast ? "" : ' style="page-break-after: always;"'}>${inner}</div>`;
    })
    .join("\n");

  // Background engravings (BackgroundEngraving.tsx) reference static
  // files under public/engravings/ by path — resolve those to base64
  // before Tailwind scans the markup (doesn't affect scanning either
  // way, but keeps the two passes clearly separated: content first,
  // then styling).
  const pagesMarkup = await inlineEngravingImages(rawPagesMarkup);

  const [tailwindCss, fontCss] = await Promise.all([
    buildTailwindCssForHtml(pagesMarkup),
    getEmbeddedFontCss(),
  ]);

  // Диагностика (временно, QA: "ПДФ до сих пор выдает обрезанный
  // первый лист" — после того как та же страница отлично помещалась в
  // живом превью): если встраивание шрифтов не удалось, PDF молча
  // печатается системным fallback-шрифтом (Arial Narrow/Arial — они
  // шире Oswald/PT Sans), из-за чего мелкий текст переносится на
  // больше строк и раздувает страницу 1 за 297мм — то есть выглядит
  // как ошибка вёрстки, хотя причина в шрифтах. Явный красный маркер
  // в самом PDF сразу покажет, действительно ли сейчас произошёл этот
  // откат — снять после диагностики.
  const fontFallbackWarning = fontCss
    ? ""
    : `<div style="position:fixed;top:0;left:0;z-index:9999;background:#c00;color:#fff;font:bold 10px sans-serif;padding:2mm 4mm;">ШРИФТЫ НЕ ЗАГРУЖЕНЫ — PDF печатается fallback-шрифтом (диагностика)</div>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<style>
  /* Минимальный печатный reset — вместо Tailwind preflight (preflight
     отключён в buildTailwindCss.ts, чтобы не тянуть лишние правила,
     не нужные для статического печатного документа). */
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  img { max-width: none; }
  @page { size: A4; margin: 0; }
  .pdf-page-wrap { width: 210mm; height: 297mm; overflow: hidden; }

  :root {
    --font-display: 'Oswald', 'Arial Narrow', sans-serif;
    --font-body: 'PT Sans', Arial, sans-serif;
  }

  ${fontCss}
  ${tailwindCss}
</style>
</head>
<body>
${fontFallbackWarning}
${pagesMarkup}
</body>
</html>`;
}
