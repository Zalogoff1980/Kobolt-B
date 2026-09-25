import { test, expect } from "@playwright/test";
import { attachConsoleGuard, assertNoConsoleErrors, createIssueViaUI, deleteIssueViaUI } from "./helpers";

/**
 * Dashboard: создание, отображение, удаление с подтверждением,
 * персистентность после reload (ТЗ шага 8 п.18, шага 10 п.5/8).
 */
test.describe("dashboard", () => {
  test("app actually starts and serves the dashboard", async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const response = await page.goto("/");
    expect(response?.status(), "Next.js должен ответить 200 на /").toBeLessThan(400);
    await expect(page.getByText("КОБОЛЬТ-Б")).toBeVisible();
    assertNoConsoleErrors(errors);
  });

  test("create → appears in dashboard → open → correct issue → delete with confirmation", async ({
    page,
  }) => {
    const errors = attachConsoleGuard(page);
    const issueId = await createIssueViaUI(page, { number: "TEST-D1", date: "2025-02-01" });

    // Открыть выпуск — редактор должен показывать именно этот выпуск.
    await expect(page.locator('[data-testid="issue-meta"]')).toContainText("TEST-D1");

    // Вернуться на Dashboard — новый выпуск должен быть в списке.
    await page.goto("/");
    const row = page.locator(`[data-testid="issue-row"][data-issue-id="${issueId}"]`);
    await expect(row).toBeVisible();
    await expect(row.locator('[data-testid="issue-row-title"]')).toContainText("TEST-D1");

    // Открыть по кнопке — должен открыться тот же самый выпуск.
    await row.locator('[data-testid="open-issue-link"]').click();
    await page.waitForURL(new RegExp(`/issues/${issueId}$`));

    // Удаление требует подтверждения.
    await page.goto("/");
    const row2 = page.locator(`[data-testid="issue-row"][data-issue-id="${issueId}"]`);
    await row2.locator('[data-testid="delete-issue-button"]').click();
    await expect(page.locator('[data-testid="delete-confirm-dialog"]')).toBeVisible();
    await page.locator('[data-testid="cancel-delete-button"]').click();
    await expect(row2).toBeVisible(); // отмена — выпуск остаётся

    await deleteIssueViaUI(page, issueId);

    // Reload — удалённый выпуск не должен вернуться.
    await page.reload();
    await expect(page.locator(`[data-testid="issue-row"][data-issue-id="${issueId}"]`)).toHaveCount(0);

    assertNoConsoleErrors(errors);
  });

  test("empty state renders when there are no issues (fresh IndexedDB profile only)", async ({
    page,
  }) => {
    // Осмысленно только в чистом браузерном профиле — в CI с пустым
    // storage state. Если запускается локально поверх уже заполненной
    // БД, этот тест ничего не проверяет содержательно и его можно
    // пропустить (см. README → Runtime QA).
    await page.goto("/");
    const rows = page.locator('[data-testid="issue-row"]');
    if ((await rows.count()) === 0) {
      await expect(page.locator('[data-testid="dashboard-empty-state"]')).toBeVisible();
    }
  });
});
