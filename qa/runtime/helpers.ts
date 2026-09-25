import path from "path";
import { Page, expect } from "@playwright/test";

/** Реальные маленькие PNG-фикстуры (4×4px, разного цвета) для тестов
 *  загрузки/замены изображения — не строка-заглушка, а настоящие
 *  файлы на диске, которые Playwright передаёт через setInputFiles. */
export const FIXTURE_PHOTO_A = path.join(__dirname, "fixtures", "tiny-red.png");
export const FIXTURE_PHOTO_B = path.join(__dirname, "fixtures", "tiny-olive.png");

/**
 * Общие помощники реальных runtime-тестов. Никакого mock DOM —
 * только Page API настоящего Playwright-браузера.
 */

/** Подключает жёсткий контроль консоли (ТЗ шага 10, п.10): падать на
 *  console.error, pageerror, unhandled rejection и React key/hydration
 *  warnings. Обычные console.warn не считаем ошибкой — это не входит
 *  в список из ТЗ. Возвращает массив пойманных сообщений; вызывающий
 *  тест сам решает, когда его проверить (после навигации/действия). */
export function attachConsoleGuard(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[console.error] ${msg.text()}`);
    }
    const text = msg.text();
    if (
      text.includes("Each child in a list should have a unique") ||
      text.includes("Warning: Each child") ||
      text.toLowerCase().includes("hydration")
    ) {
      errors.push(`[react-warning] ${text}`);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    errors.push(`[network-failed] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });

  return errors;
}

export function assertNoConsoleErrors(errors: string[]) {
  expect(errors, `Console/runtime errors captured:\n${errors.join("\n")}`).toEqual([]);
}

/** Создаёт тестовый выпуск через реальный UI (Dashboard → "Создать
 *  выпуск" → форма), а не напрямую через IndexedDB API — так тест
 *  проверяет тот же путь, которым пользуется настоящий пользователь.
 *  Возвращает issueId, извлечённый из итогового URL редактора. */
export async function createIssueViaUI(
  page: Page,
  params: { number: string; date: string }
): Promise<string> {
  await page.goto("/issues/new");
  await page.fill("#number", params.number);
  await page.fill("#date", params.date);
  await page.click('[data-testid="submit-new-issue"]');
  // Важно: /^\/issues\/[^/]+$/ также совпадает с самим "/issues/new" —
  // если проверять его до навигации, waitForURL резолвится немедленно
  // и по ошибке. crypto.randomUUID() — точный v4-UUID, матчим именно его.
  await page.waitForURL(/\/issues\/[0-9a-f-]{36}$/);
  const url = page.url();
  const match = url.match(/\/issues\/([0-9a-f-]{36})$/);
  // tsconfig has noUncheckedIndexedAccess: true — match[1] alone is typed
  // string | undefined even after confirming `match` is non-null (array
  // element access is checked independently), so it needs its own guard.
  const issueId = match?.[1];
  if (!issueId) throw new Error(`Could not extract issueId from URL: ${url}`);
  return issueId;
}

/** Удаляет тестовый выпуск через Dashboard UI (не напрямую через
 *  IndexedDB), чтобы тест не оставлял проект в изменённом состоянии
 *  (ТЗ шага 10, п.5) и заодно проверял сам механизм удаления. */
export async function deleteIssueViaUI(page: Page, issueId: string) {
  await page.goto("/");
  const row = page.locator(`[data-testid="issue-row"][data-issue-id="${issueId}"]`);
  await row.locator('[data-testid="delete-issue-button"]').click();
  await page.locator('[data-testid="confirm-delete-button"]').click();
  await expect(page.locator(`[data-testid="issue-row"][data-issue-id="${issueId}"]`)).toHaveCount(0);
}

