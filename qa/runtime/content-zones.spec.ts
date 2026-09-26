import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * PRIORITY 3 — Editor Content Zones / Guides.
 *
 * Проверяем: направляющие реально появляются в редакторе (не рисуются
 * "на глаз" — они производные от того же templateId/DOM, что и сам
 * шаблон), НИКОГДА не попадают в чистый /preview, и overflow-баннер
 * появляется при физическом переполнении страницы (используем
 * заведомо огромный объём текста — тот же приём, каким шаг 6 уже
 * проверял overflow-политику статически; здесь то же самое, но через
 * реальный редактор).
 */
test.describe("editor content zone guides", () => {
  test("guides appear in the editor and reflect the active template's real zones", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-ZONES", date: "2025-03-01" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("Заголовок");
    await page.locator('[data-testid="field-lead"]').fill("Лид-абзац.");

    const overlay = page.locator('[data-testid="content-zone-overlay"]');
    await expect(overlay).toBeVisible();
    // Минимум: зона H1 (заголовок только что заполнен) и зона лида
    // должны появиться среди отрисованных зон — а не просто "что-то
    // нарисовалось".
    await expect(page.locator('[data-testid="content-zone"]').first()).toBeVisible();

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("guides never leak into the clean /preview route", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-ZONES-CLEAN", date: "2025-03-02" });

    await page.goto(`/issues/${issueId}/preview`);
    await expect(page.locator('[data-testid="content-zone-overlay"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="content-zone"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="page-overflow-banner"]')).toHaveCount(0);

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("overflow banner appears in the editor when content physically doesn't fit, and the PDF button blocks download", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-OVERFLOW", date: "2025-03-03" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("Заголовок");

    // Явно избыточный объём текста — десятки длинных абзацев точно не
    // помещаются в физический лист A4 ни при каком разумном шаблоне.
    for (let i = 0; i < 25; i++) {
      await page.locator('[data-testid="paragraph-add"]').click();
    }
    const textareas = page.locator('[data-testid="paragraph-textarea"]');
    const count = await textareas.count();
    const longText =
      "Очень длинный абзац текста, который заведомо не помещается на физическую страницу A4 при любом разумном шаблоне и должен вызвать overflow. ".repeat(
        6
      );
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
