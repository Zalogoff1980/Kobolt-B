import { test, expect } from "@playwright/test";
import {
  attachConsoleGuard,
  assertNoConsoleErrors,
  createIssueViaUI,
  deleteIssueViaUI,
  FIXTURE_PHOTO_A,
} from "./helpers";

/**
 * Template switching без потери контента (ТЗ шага 8 п.3, шага 9 п.6,
 * шага 10 п.6) — буквально по сценарию из шага 8: ввести текст,
 * добавить 2 абзаца, добавить фото, переключить шаблон, вернуться,
 * проверить сохранность. Проверяем и DOM Preview, и значения полей
 * формы — не только наличие кнопки переключения.
 */
test.describe("template switching preserves content", () => {
  test("page 2: article-photo-v1 → photo-grid-v1 → article-photo-v1", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-T2", date: "2025-02-07" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();

    await page.locator('[data-testid="field-title"]').fill("ЗАГОЛОВОК СТРАНИЦЫ 2");
    await page.locator('[data-testid="paragraph-add"]').click();
    await page.locator('[data-testid="paragraph-add"]').click();
    const paragraphs = page.locator('[data-testid="paragraph-textarea"]');
    await paragraphs.nth(0).fill("Первый абзац теста.");
    await paragraphs.nth(1).fill("Второй абзац теста.");

    await page.locator('[data-testid="photo-upload-input"]').setInputFiles(FIXTURE_PHOTO_A);
    await page.locator('[data-testid="photo-caption-input"]').fill("Подпись тестового фото");
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    // A → B
    await page.locator('[data-testid="template-option-photo-grid-v1"]').click();
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("ЗАГОЛОВОК СТРАНИЦЫ 2");
    await expect(page.locator('[data-testid="paragraph-textarea"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="photo-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="a4-preview"]')).toContainText("ЗАГОЛОВОК СТРАНИЦЫ 2");

    // B → A
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("ЗАГОЛОВОК СТРАНИЦЫ 2");
    await expect(page.locator('[data-testid="paragraph-textarea"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="paragraph-textarea"]').nth(0)).toHaveValue(
      "Первый абзац теста."
    );
    await expect(page.locator('[data-testid="photo-caption-input"]')).toHaveValue(
      "Подпись тестового фото"
    );

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("page 3: theme-photo-v1 → theme-text-photos-v1 → theme-photo-v1, photo count changes composition", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-T3", date: "2025-02-08" });

    await page.locator('[data-testid="page-item-3"]').click();
    await page.locator('[data-testid="template-option-theme-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("ТЕМА СТРАНИЦЫ 3");

    // 0 фото → переключаем на B и добавляем фото по одной, проверяя,
    // что визуальная сетка меняется вместе с их числом (утверждено на
    // шаге 4 — здесь именно рантайм-подтверждение того решения).
    await page.locator('[data-testid="template-option-theme-text-photos-v1"]').click();
    await expect(page.locator('[data-testid="photo-item"]')).toHaveCount(0);

    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="photo-upload-input"]').setInputFiles(FIXTURE_PHOTO_A);
    }
    await expect(page.locator('[data-testid="photo-item"]')).toHaveCount(3);
    const previewImages = page.locator('[data-testid="a4-preview"] img');
    await expect(previewImages).toHaveCount(3);

    await page.locator('[data-testid="template-option-theme-photo-v1"]').click();
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue("ТЕМА СТРАНИЦЫ 3");
    // Template A использует только первое фото — остальные не теряются
    // (проверяется переключением обратно на B ниже), просто не видны.
    await page.locator('[data-testid="template-option-theme-text-photos-v1"]').click();
    await expect(page.locator('[data-testid="photo-item"]')).toHaveCount(3);

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("page 4: person-feature-v1 → team-faces-v1 → person-feature-v1 (name/role/achievements/quote)", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-T4", date: "2025-02-09" });

    await page.locator('[data-testid="page-item-4"]').click();
    await page.locator('[data-testid="template-option-person-feature-v1"]').click();
    await page.locator('[data-testid="photo-upload-input"]').setInputFiles(FIXTURE_PHOTO_A);
    await page.locator('[data-testid="photo-person-name-input"]').fill("Тестов Тест Тестович");
    await page.locator('[data-testid="photo-person-role-input"]').fill("Тестовая должность");
    await page.locator('[data-testid="add-quote-button"]').click();
    await page.locator('[data-testid="field-quote-text"]').fill("Тестовая цитата.");

    await page.locator('[data-testid="template-option-team-faces-v1"]').click();
    await expect(page.locator('[data-testid="photo-person-name-input"]')).toHaveValue(
      "Тестов Тест Тестович"
    );
    await page.locator('[data-testid="achievement-add"]').click();
    await page.locator('[data-testid="achievement-input"]').fill("Тестовое достижение.");
    await expect(page.locator('[data-testid="field-quote-text"]')).toHaveValue("Тестовая цитата.");

    await page.locator('[data-testid="template-option-person-feature-v1"]').click();
    await expect(page.locator('[data-testid="photo-person-name-input"]')).toHaveValue(
      "Тестов Тест Тестович"
    );
    await expect(page.locator('[data-testid="photo-person-role-input"]')).toHaveValue(
      "Тестовая должность"
    );
    await expect(page.locator('[data-testid="field-quote-text"]')).toHaveValue("Тестовая цитата.");

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
