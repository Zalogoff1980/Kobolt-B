import { test, expect } from "@playwright/test";
import {
  attachConsoleGuard,
  assertNoConsoleErrors,
  createIssueViaUI,
  deleteIssueViaUI,
  FIXTURE_PHOTO_A,
  FIXTURE_PHOTO_B,
} from "./helpers";

/** Image storage: upload → preview → save → reload → still there;
 *  replace; delete → no placeholder on page 4 (ТЗ шага 8 п.9–10,
 *  шага 9 п.7/9, шага 10 п.7). */
test.describe("image persistence", () => {
  test("upload → save → reload → still visible; replace; delete", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-IMG", date: "2025-02-10" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="photo-upload-input"]').setInputFiles(FIXTURE_PHOTO_A);

    const previewImg = page.locator('[data-testid="a4-preview"] img').first();
    await expect(previewImg).toBeVisible();
    const srcAfterUpload = await previewImg.getAttribute("src");
    // Критично: не blob:-URL (тот не переживает reload), а data: URL.
    expect(srcAfterUpload?.startsWith("data:image/")).toBe(true);

    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");
    await page.reload();
    await page.locator('[data-testid="page-item-2"]').click();
    await expect(page.locator('[data-testid="a4-preview"] img').first()).toBeVisible();
    const srcAfterReload = await page.locator('[data-testid="a4-preview"] img').first().getAttribute("src");
    expect(srcAfterReload).toBe(srcAfterUpload);

    // Замена изображения.
    await page.locator('[data-testid="photo-replace-input"]').setInputFiles(FIXTURE_PHOTO_B);
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");
    await page.reload();
    await page.locator('[data-testid="page-item-2"]').click();
    const srcAfterReplace = await page.locator('[data-testid="a4-preview"] img').first().getAttribute("src");
    expect(srcAfterReplace).not.toBe(srcAfterReload);

    // Удаление.
    await page.locator('[data-testid="photo-remove-button"]').click();
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");
    await page.reload();
    await page.locator('[data-testid="page-item-2"]').click();
    await expect(page.locator('[data-testid="a4-preview"] img')).toHaveCount(0);

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });

  test("page 4: deleting the only photo shows NO placeholder graphic", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-IMG4", date: "2025-02-11" });

    await page.locator('[data-testid="page-item-4"]').click();
    await page.locator('[data-testid="template-option-person-feature-v1"]').click();

    // ArticleTitle всегда рисует один и тот же декоративный SVG-росчерк
    // рядом с заголовком (EngravingTank) — это НЕ заглушка фото, она
    // должна быть постоянно, независимо от наличия фото. Отдельная
    // "заглушка вместо портрета" — это ДРУГОЙ инстанс того же
    // компонента, который PersonFeature/TeamFaces намеренно не рисуют
    // (правило шага 5). Поэтому корректный инвариант — SVG ровно 1,
    // и до, и после добавления/удаления фото, а не "0 SVG вообще".
    const svgCount = () => page.locator('[data-testid="a4-preview"] svg').count();
    const baselineSvgCount = await svgCount();

    await page.locator('[data-testid="photo-upload-input"]').setInputFiles(FIXTURE_PHOTO_A);
    await expect(page.locator('[data-testid="a4-preview"] img')).toHaveCount(1);
    expect(await svgCount()).toBe(baselineSvgCount); // фото не убрало и не добавило SVG

    await page.locator('[data-testid="photo-remove-button"]').click();
    await expect(page.locator('[data-testid="save-status"]')).toHaveText("Сохранено ✓");

    // Ни одного <img>, и число SVG вернулось к базовому — заглушка
    // (дополнительный SVG вместо фото) не появилась.
    await expect(page.locator('[data-testid="a4-preview"] img')).toHaveCount(0);
    expect(await svgCount()).toBe(baselineSvgCount);

    await page.reload();
    await page.locator('[data-testid="page-item-4"]').click();
    await expect(page.locator('[data-testid="a4-preview"] img')).toHaveCount(0);
    expect(await svgCount()).toBe(baselineSvgCount);

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
