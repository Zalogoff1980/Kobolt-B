import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * Content persistence + autosave (ТЗ шага 8 п.4–5, шага 9 п.4–5,
 * шага 10 п.5/11). Индикатор "Сохранено ✓" здесь не принимается на
 * веру — тест реально перезагружает страницу и читает значение из
 * DOM после reload, то есть из настоящего IndexedDB, а не из React
 * state, которое reload обнуляет в любом случае.
 */
test.describe("content persistence", () => {
  test("H1 edit survives a full reload, autosave indicator reflects a real write", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-P1", date: "2025-02-02" });

    // Страница 2, чтобы поле titleLevel=1 (H1) было однозначным.
    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();

    const titleField = page.locator('[data-testid="field-title"]');
    await titleField.fill("ТЕСТ СОХРАНЕНИЯ 123");

    // "Сохранение…" должно появиться, затем смениться на "Сохранено ✓" —
    // ждём именно это состояние, а не таймаут по часам.
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓", {
      timeout: 5_000,
    });

    await page.reload();
    await expect(page.locator('[data-testid="page-item-2"]')).toBeVisible();
    await page.locator('[data-testid="page-item-2"]').click();
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("ТЕСТ СОХРАНЕНИЯ 123");
    // И то же самое значение должно попасть в реальный Preview (не
    // только в поле формы) — единый источник данных, не два разных.
    await expect(page.locator('[data-testid="a4-preview"]')).toContainText("ТЕСТ СОХРАНЕНИЯ 123");

    // Вернуть исходный текст и снова сохранить — тест не должен
    // оставлять проект в изменённом состоянии.
    await titleField.fill("История нашего батальона");
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓", {
      timeout: 5_000,
    });

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("new issue does not inherit another issue's edits (isolation)", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueA = await createIssueViaUI(page, { number: "TEST-ISO-A", date: "2025-02-03" });
    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("ЗАГОЛОВОК ВЫПУСКА A");
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    const issueB = await createIssueViaUI(page, { number: "TEST-ISO-B", date: "2025-02-04" });
    await page.locator('[data-testid="page-item-2"]').click();
    await expect(page.locator('[data-testid="field-title"]')).not.toHaveValue("ЗАГОЛОВОК ВЫПУСКА A");
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("");

    await deleteIssueViaUI(page, issueA);
    await deleteIssueViaUI(page, issueB);
    assertNoConsoleErrors(errors);
  });
});
