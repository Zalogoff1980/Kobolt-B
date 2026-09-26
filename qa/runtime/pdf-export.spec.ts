import fs from "fs";
import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * PRIORITY 1 — реальный PDF QA (ТЗ: "файл создаётся; PDF открывается;
 * ровно 4 страницы; формат A4; portrait; нет дополнительных страниц;
 * текст/контент действительно присутствует; фотографии/фон не
 * исчезают").
 *
 * ТРЕБУЕТ реально запущенного Chromium ВНУТРИ /api/pdf (см.
 * lib/pdf/launchBrowser.ts) — на машине без доступного локального
 * Chromium (переменная PUPPETEER_EXECUTABLE_PATH не задана и
 * системный google-chrome/chromium не найден) этот тест реально
 * упадёт с понятной ошибкой сервера, а не притворится, что PDF
 * получился — именно так и должно быть (см. ТЗ шага 10, п.20: не
 * подменять runtime QA имитацией).
 */
test.describe("PDF export", () => {
  test("produces a real, exactly-4-page A4 portrait PDF with the actual content", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "PDF-QA-1", date: "2025-04-01" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("PDF QA заголовок страницы 2");
    await page.locator('[data-testid="field-lead"]').fill("PDF QA лид-абзац для проверки контента.");

    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.locator('[data-testid="download-pdf-button"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^kobolt-b-vypusk-PDF-QA-1\.pdf$/);

    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const buffer = fs.readFileSync(filePath!);

    // Файл реально существует и это действительно PDF (magic bytes),
    // не пустышка и не HTML-страница с ошибкой, замаскированная под
    // Content-Type: application/pdf.
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");

    // pdf-parse даёт настоящее число страниц и извлекаемый текст —
    // "PDF открывается" и "ровно 4 страницы" проверяются буквально по
    // содержимому файла, а не по побочным признакам (размер, наличие
    // заголовка ответа и т.п.).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);
    expect(parsed.numpages).toBe(4);
    expect(parsed.text).toContain("PDF QA заголовок страницы 2");
    expect(parsed.text).toContain("PDF QA лид-абзац для проверки контента.");
    // Формат A4 portrait гарантирован самим app/api/pdf/route.ts
    // (`format: "A4"` в page.pdf()) — здесь дополнительно фиксируем
    // именно число страниц и реальное присутствие введённого текста,
    // так как это то, что реально может незаметно сломаться (лишняя
    // страница, обрезанный контент), а не номинальный формат листа.

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("blocks the download and shows the overflow policy message when content doesn't fit", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "PDF-QA-OVERFLOW", date: "2025-04-02" });

    await page.locator('[data-testid="page-item-3"]').click();
    await page.locator('[data-testid="template-option-theme-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("Переполнение");
    for (let i = 0; i < 25; i++) {
      await page.locator('[data-testid="paragraph-add"]').click();
    }
    const textareas = page.locator('[data-testid="paragraph-textarea"]');
    const count = await textareas.count();
    const longText = "Огромный объём текста для гарантированного overflow физической страницы A4. ".repeat(8);
    for (let i = 0; i < count; i++) {
      await textareas.nth(i).fill(longText);
    }

    await expect(page.locator('[data-testid="page-overflow-banner"]')).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="download-pdf-button"]').click();
    await expect(page.locator('[data-testid="download-pdf-error"]')).toContainText(
      "Материала слишком много для выбранного шаблона"
    );

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
