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

  /**
   * Регрессия для конкретного бага (найден вручную на Android Chrome,
   * 390×844): на mobile строка-обёртка sidebar+preview имела
   * безусловный overflow-hidden, унаследованный от desktop-раскладки,
   * где sidebar и preview стоят бок о бок и скроллятся каждый
   * отдельно. На mobile они складываются друг под другом (flex-col),
   * их суммарная высота обычно больше экрана, а обёртка их просто
   * обрезала — форма ниже "ФОТОГРАФИИ" была физически недостижима
   * никаким свайпом. Тест не хардкодит вьюпорт — играет во всех трёх
   * проектах конфига, но осмыслен именно для mobile-390 (на desktop/
   * tablet сайдбар и так укладывается в экран или скроллится
   * внутренним overflow-y-auto).
   */
  test("editor: page 2 article-photo-v1 form scrolls to reach the Photos section", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-SCROLL", date: "2025-02-13" });

    await page.locator('[data-testid="page-item-2"]').click();
    await page.locator('[data-testid="template-option-article-photo-v1"]').click();
    await page.locator('[data-testid="field-title"]').fill("Скролл-тест H1");
    await page.locator('[data-testid="field-subtitle"]').fill("Скролл-тест H2");

    // Ключевая проверка: элемент должен быть реально достижим тем же
    // способом, каким его достигает пользователь (прокруткой), а не
    // просто существовать в DOM. scrollIntoViewIfNeeded прокручивает
    // ближайший реальный scroll-контейнер — неважно, это сама
    // страница (mobile, после фикса) или внутренний overflow-y-auto
    // sidebar'а (desktop) — и затем мы проверяем, что элемент
    // действительно попал в видимую область текущего viewport.
    const photoUploadLabel = page.locator('[data-testid="photo-upload-label"]');
    await photoUploadLabel.scrollIntoViewIfNeeded();
    await expect(photoUploadLabel).toBeVisible();

    const box = await photoUploadLabel.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && viewport) {
      expect(box.y, "контрол загрузки фото должен физически попадать в текущий viewport по вертикали")
        .toBeGreaterThanOrEqual(0);
      expect(box.y).toBeLessThan(viewport.height);
    }

    const hOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(hOverflow, "прокрутка формы вниз не должна создавать горизонтальный overflow").toBeLessThanOrEqual(1);

    await deleteIssueViaUI(page, issueId);
    assertNoConsoleErrors(errors);
  });
});
