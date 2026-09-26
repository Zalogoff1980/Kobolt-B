import puppeteer, { Browser } from "puppeteer-core";

/**
 * Запускает headless Chromium для /api/pdf.
 *
 * Два окружения — два способа найти бинарник, оба через один и тот же
 * лёгкий `puppeteer-core` (без бандла собственного Chromium — на
 * Vercel serverless-функции ограничены по размеру, полный `puppeteer`
 * с бандлом Chromium туда возить нет смысла):
 *
 * 1. Vercel/production: `@sparticuz/chromium` — Chromium-сборка,
 *    спроектированная специально под serverless (маленькая, статично
 *    слинкована под Amazon Linux, на котором и работают функции
 *    Vercel). Определяем среду по `process.env.VERCEL` (стандартная
 *    переменная, которую сама платформа выставляет во всех функциях).
 * 2. Локально / GitHub Codespaces: явный путь к уже существующему
 *    Chromium через `PUPPETEER_EXECUTABLE_PATH` (стандартное для
 *    puppeteer-core имя переменной). В этом репозитории Chromium для
 *    Playwright уже ставится командой `npx playwright install
 *    chromium` (см. README → Runtime QA) — значение пути обычно можно
 *    получить командой `npx playwright install --dry-run chromium`
 *    или найти в `~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`.
 *    Если переменная не задана, пробуем несколько частых системных
 *    путей как запасной вариант, иначе — понятная ошибка вместо
 *    невнятного краша Puppeteer.
 */
export async function launchPdfBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const candidatePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.PDF_CHROMIUM_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter((p): p is string => Boolean(p));

  const fs = await import("fs");
  const executablePath = candidatePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (!executablePath) {
    throw new Error(
      "Не найден исполняемый файл Chromium для локального PDF-рендера. " +
        "Установите переменную окружения PUPPETEER_EXECUTABLE_PATH, указав на " +
        "уже установленный Chromium (например, путь Playwright из " +
        "`~/.cache/ms-playwright/chromium-*/chrome-linux/chrome` после " +
        "`npx playwright install chromium`), либо системный google-chrome/chromium."
    );
  }

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}
