import { defineConfig, devices } from "@playwright/test";

/**
 * Конфигурация реального runtime QA (шаг 9–10). Эти тесты
 * ТРЕБУЮТ установленных npm-зависимостей и доступного Chromium —
 * они не запускались в текущей песочнице (нет доступа к npm
 * registry, см. README → "Runtime QA"). Подготовлены для запуска
 * на машине/CI с интернетом: `npm install && npm run qa:runtime`.
 */
export default defineConfig({
  testDir: "./qa/runtime",
  fullyParallel: false, // тесты пишут в общий IndexedDB одного браузерного профиля
  // retries: 1 — НЕ для маскировки реальных багов (настоящая ошибка
  // провалится и на повторе). Нужен конкретно для "Page crashed" на
  // page.reload() — категория "проблема окружения", не код.
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // --disable-dev-shm-usage — стандартный обход известной проблемы
    // headless Chromium в контейнерах (Docker/Codespaces): /dev/shm
    // там обычно урезан до нескольких МБ, и Chromium иногда валит
    // рендер-процесс именно на page.reload() из-за нехватки shared
    // memory ("Page crashed"). Флаг переключает Chromium на /tmp.
    // Найдено реальным runtime QA (шаг 12): тот же сбой воспроизвёлся
    // и в маленьком прогоне из 2 тестов, не только в конце долгого —
    // значит дело не в накоплении состояния за долгий прогон, а в
    // самом контейнере.
    launchOptions: {
      args: ["--disable-dev-shm-usage"],
    },
  },
  projects: [
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet-1024",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } },
    },
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
