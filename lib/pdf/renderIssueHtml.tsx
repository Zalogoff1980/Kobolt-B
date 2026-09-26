import { renderToStaticMarkup } from "react-dom/server";
import { Issue } from "@/lib/content/issue";
import { A4Page } from "@/components/canvas/A4Page";
import { buildTailwindCssForHtml } from "./buildTailwindCss";
import { getEmbeddedFontCss } from "./googleFonts";

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
  const pagesMarkup = ([1, 2, 3, 4] as const)
    .map((n, i) => {
      const inner = renderToStaticMarkup(<A4Page issue={issue} pageNumber={n} />);
      const isLast = i === 3;
      return `<div class="pdf-page-wrap"${isLast ? "" : ' style="page-break-after: always;"'}>${inner}</div>`;
    })
    .join("\n");

  const [tailwindCss, fontCss] = await Promise.all([
    buildTailwindCssForHtml(pagesMarkup),
    getEmbeddedFontCss(),
  ]);

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
${pagesMarkup}
</body>
</html>`;
}
