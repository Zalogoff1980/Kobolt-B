import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * Регрессия для найденной проблемы иерархии контента (не локальной для
 * страницы 3 — системной для всех внутренних страниц): H1/H2/основной
 * текст/абзацы должны быть различимыми полями с собственной
 * семантикой, а не определяться порядком блоков в массиве. Проверяем
 * само поле "Основной текст" (лид), что оно не путается с обычными
 * абзацами, переживает смену шаблона, и что обложка (у которой лида
 * нет по смыслу) не ломается.
 */
test.describe("content hierarchy", () => {
  test("page 2: lead is a distinct field from regular paragraphs, survives template switch", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-HIER", date: "2025-02-14" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();

    await page.locator('[data-testid="field-title"]').fill("H1 иерархии");
    await page.locator('[data-testid="field-subtitle"]').fill("H2 иерархии");
    await page.locator('[data-testid="field-lead"]').fill("ЭТО ЛИД — вводный абзац.");
    await page.locator('[data-testid="paragraph-add"]').click();
    await page.locator('[data-testid="paragraph-textarea"]').fill("Это обычный абзац.");
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    const preview = page.locator('[data-testid="a4-preview"]');
    await expect(preview).toContainText("ЭТО ЛИД — вводный абзац.");
    await expect(preview).toContainText("Это обычный абзац.");

    // Лид не должен задваиваться в списке обычных абзацев формы —
    // ровно один paragraph-textarea (сам лид живёт в отдельном поле).
    await expect(page.locator('[data-testid="paragraph-textarea"]')).toHaveCount(1);

    // Смена шаблона: лид и обычный абзац должны сохраниться оба и не
    // перепутаться местами/ролями.
    await page.locator('[data-testid="template-option-photo-grid-v1"]').click();
    await expect(page.locator('[data-testid="field-lead"]')).toHaveValue("ЭТО ЛИД — вводный абзац.");
    await expect(page.locator('[data-testid="paragraph-textarea"]')).toHaveValue("Это обычный абзац.");
    await expect(preview).toContainText("ЭТО ЛИД — вводный абзац.");

    await page.reload();
    await page.locator('[data-testid="page-item-2"]').click();
    await expect(page.locator('[data-testid="field-lead"]')).toHaveValue("ЭТО ЛИД — вводный абзац.");

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("cover (page 1) has no lead field and is unaffected by the hierarchy model", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-COVER-HIER", date: "2025-02-15" });

    // Страница 1 активна по умолчанию — CoverForm рендерится, у него
    // нет и не должно быть поля "Основной текст" (обложка — отдельная
    // структура, лид туда не относится).
    await expect(page.locator('[data-testid="field-lead"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="field-title"]')).toBeVisible(); // hero-заголовок обложки

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
