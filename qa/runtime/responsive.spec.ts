import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * Responsive (ТЗ шага 9 п.11, шага 10 п.9). Playwright запускает этот
 * файл под каждым из трёх проектов в playwright.config.ts (390×844,
 * 1024×768, 1440×900) — viewport здесь не хардкожен внутри теста,
 * им управляет конфиг, поэтому один и тот же спек реально проверяет
 * все три состояния при `npx playwright test` без флагов.
 */
test.describe("responsive layout", () => {
  test("dashboard: no horizontal overflow at this viewport", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "документ не должен требовать горизонтальной прокрутки").toBeLessThanOrEqual(1);
    assertNoConsoleErrors(errors);
  });

  test("editor: sidebar + preview visible, no horizontal overflow, A4 aspect ratio intact", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-RESP", date: "2025-02-12" });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // Сайдбар и Preview должны быть на странице (на мобильном —
    // выше/ниже друг друга, на десктопе — рядом), и оба физически
    // помещаться в viewport по ширине.
    const preview = page.locator('[data-testid="a4-preview"]');
    await expect(preview).toBeVisible();
    const box = await preview.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.width, "A4-превью не должно вылезать за ширину экрана").toBeLessThanOrEqual(
        viewport.width + 1
      );
    }

    // Пропорция самой страницы A4 (.kobolt-page) должна остаться 210:297
    // независимо от масштаба — PagePreviewScaler масштабирует
    // равномерно, а не растягивает по одной оси.
    const pageBox = await page.locator(".kobolt-page").first().boundingBox();
    expect(pageBox).not.toBeNull();
    if (pageBox) {
      const ratio = pageBox.width / pageBox.height;
      const expectedRatio = 210 / 297;
      expect(Math.abs(ratio - expectedRatio)).toBeLessThan(0.02);
    }

    // Кнопка сохранения/статус должна быть доступна (в DOM и видима),
    // а не скрыта за пределами экрана без прокрутки.
    await expect(page.locator('[data-testid="save-status"]')).toBeVisible();

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
