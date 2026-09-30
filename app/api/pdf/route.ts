import { NextRequest, NextResponse } from "next/server";
import { assertValidIssueShape } from "@/lib/pdf/validateIssue";
import { renderIssueHtml } from "@/lib/pdf/renderIssueHtml";
import { launchPdfBrowser } from "@/lib/pdf/launchBrowser";

/**
 * PRIORITY 1 — /api/pdf.
 *
 * Клиент присылает ПОЛНЫЙ Issue JSON целиком в теле POST-запроса
 * (ТЗ п.4) — этот route ничего не читает из IndexedDB и вообще о ней
 * не знает: IndexedDB — браузерное хранилище, серверу оно физически
 * недоступно (ТЗ п.5 в этом смысле выполняется автоматически самой
 * природой IndexedDB, а не отдельной мерой предосторожности).
 *
 * Раскладка: renderIssueHtml() строит один HTML-документ из ТЕХ ЖЕ
 * React-шаблонов (`A4Page`), что и живой Preview, со всеми 4
 * страницами подряд и `page-break-after` между ними — Puppeteer печатает
 * этот документ ОДНИМ вызовом `page.pdf()`, что само по себе даёт
 * ровно 4 физические страницы без склейки через сторонние библиотеки
 * (п.9 — "никаких неожиданных дополнительных страниц").
 *
 * `preferCSSPageSize` НЕ используется — `format: "A4"` вместе с
 * margin: 0 у Puppeteer и `.pdf-page-wrap { width: 210mm; height: 297mm }`
 * в самом документе гарантируют один и тот же физический размер уже
 * на двух независимых уровнях (сам layout + печатный формат), а не
 * полагаются на то, что мы правильно объявили `@page` без опечаток.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

function pdfFilename(issueNumber: string): string {
  // Номер выпуска пользователь вводит свободным текстом (см.
  // lib/content/issue.ts: "храним как ввёл пользователь, без
  // парсинга") — для имени файла оставляем только буквы/цифры/дефис,
  // чтобы не сломать заголовок Content-Disposition произвольными
  // символами (пробелы, слэши, кавычки и т.п.).
  const safe = issueNumber.replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "") || "0";
  return `kobolt-b-vypusk-${safe}.pdf`;
}

export async function POST(req: NextRequest) {
  let issue: unknown;
  try {
    issue = await req.json();
  } catch {
    return NextResponse.json({ error: "Тело запроса должно быть валидным JSON (Issue)." }, { status: 400 });
  }

  try {
    assertValidIssueShape(issue);
  } catch (err) {
    return NextResponse.json(
      { error: `Некорректный формат выпуска: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 }
    );
  }

  let browser: Awaited<ReturnType<typeof launchPdfBrowser>> | undefined;
  try {
    const html = await renderIssueHtml(issue);

    browser = await launchPdfBrowser();
    const page = await browser.newPage();
    // Puppeteer's OWN default navigation timeout is 30000ms — completely
    // independent of `export const maxDuration = 60` above, which only
    // caps the serverless function itself. With real, large issues (4
    // pages of embedded base64 photos + fonts to decode/layout) that
    // 30s default was hit and aborted the export ("Navigation timeout of
    // 30000 ms exceeded", reported live) well before the function's own
    // 60s budget ran out. Raised to 55s here — leaves a few seconds of
    // headroom under maxDuration for browser launch + page.pdf() + the
    // HTTP response itself.
    //
    // waitUntil: "load" instead of the former "networkidle0" — every
    // resource this document references (photos, webfonts, static
    // engraving/emblem images) is ALREADY embedded as a data: URL by the
    // time this HTML string exists (see renderIssueHtml.tsx/
    // googleFonts.ts/inlineStaticImages.ts) — there is no real network
    // activity to wait out, "load" (fires once images are decoded) is
    // both sufficient and less prone to being kept open by an
    // unrelated background connection than the network-idle heuristic.
    await page.setContent(html, { waitUntil: "load", timeout: 55_000 });

    const pdfBuffer = await page.pdf({
      // puppeteer-core типизирует PDFOptions.format строго нижним
      // регистром ("a4", не "A4") — Chromium сам регистронезависим,
      // но TypeScript-типы — нет.
      format: "a4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      timeout: 55_000,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFilename(issue.number)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line no-console
    console.error("[api/pdf] generation failed:", err);
    return NextResponse.json(
      {
        error:
          "Не удалось сформировать PDF. " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 }
    );
  }
}
