import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/** Page order, active page sync, и редактор обложки (ТЗ шага 8 п.1–2,
 *  п.6, шага 9 п.3/8). */
test.describe("editor shell", () => {
  test("sidebar always lists pages 01→04 in order, page 01 is active by default", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-E1", date: "2025-02-05" });

    const items = page.locator('[data-testid^="page-item-"]');
    await expect(items).toHaveCount(4);
    // Порядок в DOM должен быть буквально 1,2,3,4 — не отсортирован
    // по title/updatedAt/template.
    for (let i = 0; i < 4; i++) {
      await expect(items.nth(i)).toHaveAttribute("data-testid", `page-item-${i + 1}`);
    }

    // По умолчанию активна страница 01, и Preview показывает именно её
    // (обложка — единственная страница без InnerHeader; точная фраза
    // "Танковый батальон | Боевой листок" — источник InnerHeader.tsx,
    // Masthead.tsx её не использует).
    await expect(page.locator('[data-testid="page-item-1"]')).toHaveAttribute("data-active", "true");
    await expect(page.locator('[data-testid="a4-preview"]')).not.toContainText(
      "Танковый батальон | Боевой листок"
    );

    // Переключение страницы: sidebar highlight и Preview должны
    // синхронно указывать на одну и ту же страницу. Свежесозданный
    // выпуск ещё не имеет шаблона на странице 3 — A4Page в этом
    // случае рендерит фолбэк "Страница 3: шаблон не выбран" (без
    // ведущего нуля), проверяем именно этот текст, а не "03".
    await page.locator('[data-testid="page-item-3"]').click();
    await expect(page.locator('[data-testid="page-item-3"]')).toHaveAttribute("data-active", "true");
    await expect(page.locator('[data-testid="page-item-1"]')).toHaveAttribute("data-active", "false");
    await expect(page.locator('[data-testid="a4-preview"]')).toContainText("Страница 3");

    // Теперь выбираем шаблон — тогда уже должен появиться настоящий
    // InnerHeader с зафиксированным номером "03".
    await page.locator('[data-testid="template-option-theme-photo-v1"]').click();
    await expect(page.locator('[data-testid="a4-preview"]')).toContainText("03");

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("cover editor: H1/subtitle/caption/quote/author reach CoverV1", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-COVER", date: "2025-02-06" });

    await page.locator('[data-testid="field-title"]').fill("ПРОВЕРКА ГЛАВНОГО ЗАГОЛОВКА");
    await page.locator('[data-testid="field-subtitle"]').fill("Проверка подзаголовка");
    await page.locator('[data-testid="add-quote-button"]').click();
    await page.locator('[data-testid="field-quote-text"]').fill("Тестовая цитата обложки.");
    await page.locator('[data-testid="field-quote-author"]').fill("Автор теста");
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    const preview = page.locator('[data-testid="a4-preview"]');
    await expect(preview).toContainText("ПРОВЕРКА ГЛАВНОГО ЗАГОЛОВКА");
    await expect(preview).toContainText("Проверка подзаголовка");
    await expect(preview).toContainText("Тестовая цитата обложки.");
    await expect(preview).toContainText("Автор теста");

    await page.reload();
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("ПРОВЕРКА ГЛАВНОГО ЗАГОЛОВКА");
    await expect(preview).toContainText("ПРОВЕРКА ГЛАВНОГО ЗАГОЛОВКА");

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
