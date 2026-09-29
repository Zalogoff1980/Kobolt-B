import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * Навигация по редактору: свёртываемые секции формы, переход от блока
 * на странице к его полю, предупреждение о переполнении в списке
 * страниц. Как и остальные спеки, играет во всех трёх проектах конфига
 * (390×844, 1024×768, 1440×900) — viewport здесь не хардкожен.
 */
test.describe("editor navigation", () => {
  test("form sections collapse/expand one by one and all at once", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-NAV-1", date: "2025-04-01" });

    const title = page.locator('[data-testid="field-title"]');
    const toggle = page.locator('[data-testid="section-toggle-cover-title"]');

    await expect(title).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(title).toBeHidden();
    await toggle.click();
    await expect(title).toBeVisible();

    await page.locator('[data-testid="sections-collapse-all"]').click();
    await expect(title).toBeHidden();
    await expect(page.locator('[data-testid="field-cover-news"]')).toBeHidden();

    await page.locator('[data-testid="sections-expand-all"]').click();
    await expect(title).toBeVisible();
    await expect(page.locator('[data-testid="field-cover-news"]')).toBeVisible();

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("clicking a block on the page expands its section and focuses the field", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-NAV-2", date: "2025-04-02" });

    const title = page.locator('[data-testid="field-title"]');
    await title.fill("Клик-тест");

    // Сворачиваем секцию заголовка: клик по блоку на странице должен
    // сам раскрыть её и поставить курсор в поле.
    await page.locator('[data-testid="section-toggle-cover-title"]').click();
    await expect(title).toBeHidden();

    await page.locator('[data-testid="a4-preview"] [data-zone="h1"]').first().click();

    await expect(title).toBeVisible();
    await expect(title).toBeFocused();

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("a page whose content does not fit is marked in the page list", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-NAV-3", date: "2025-04-03" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("Заголовок");

    await expect(page.locator('[data-testid="page-overflow-2"]')).toHaveCount(0);

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

    await expect(page.locator('[data-testid="page-overflow-2"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="active-page-overflow-notice"]')).toBeVisible();

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
