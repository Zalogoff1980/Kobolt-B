/**
 * Самостоятельная (независимая от next/font) загрузка тех же двух
 * шрифтов (Oswald, PT Sans — см. app/layout.tsx) для /api/pdf.
 *
 * Почему не переиспользовать next/font напрямую: next/font встраивает
 * шрифты как хешированные статические файлы САМОЙ next-сборки и
 * прописывает @font-face через CSS-переменную на <html> в RootLayout —
 * это относится к обычному Next.js рендерингу страниц, а не к отдельно
 * собираемому HTML-документу, который мы вручную скармливаем
 * Puppeteer через page.setContent(). Вместо того чтобы лазить в
 * файлы .next/static (не гарантированно доступны в serverless-функции
 * рантайма и зависят от билда), берём woff2 напрямую с Google Fonts —
 * тот же самый источник, из которого next/font их скачивает на этапе
 * сборки — и один раз конвертируем в base64 data: URL, встраиваемый
 * прямо в <style> PDF-документа. Итог не зависит от сети во время
 * самого рендера PDF (шрифт уже данные, не ссылка) и переживает любой
 * количество серверных инстансов (в отличие от файлового кеша).
 *
 * Кеш в памяти процесса — best-effort ускорение повторных экспортов в
 * тёплом инстансе, не источник истины (если процесс холодный —
 * загрузится заново, это нормально и ожидаемо).
 */

let cache: string | null = null;
let cachePromise: Promise<string> | null = null;

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=PT+Sans:wght@400;700&display=swap&subset=cyrillic,cyrillic-ext,latin";

// UA важен: Google Fonts отдаёт разные форматы (woff2/woff/ttf) в
// зависимости от UA в CSS2-эндпоинте; современный Chrome UA гарантирует
// woff2 — тот же формат, что next/font кладёт в сборку.
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": CHROME_UA } });
  if (!res.ok) throw new Error(`Font CSS fetch failed: ${res.status} ${url}`);
  return res.text();
}

async function inlineFontFaceUrls(css: string): Promise<string> {
  const urlPattern = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  const urls = Array.from(new Set(Array.from(css.matchAll(urlPattern), (m) => m[1]).filter(
    (u): u is string => Boolean(u)
  )));

  const replacements = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Font file fetch failed: ${res.status} ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = url.endsWith(".woff2") ? "font/woff2" : "font/woff";
      return [url, `data:${contentType};base64,${buf.toString("base64")}`] as const;
    })
  );

  let out = css;
  for (const [url, dataUrl] of replacements) {
    out = out.split(url).join(dataUrl);
  }
  return out;
}

/** Возвращает готовый self-contained CSS (все @font-face уже как
 *  data: URL, без внешних сетевых ссылок) — безопасно вставлять в
 *  <style> и рендерить в Puppeteer без сетевого доступа на этом шаге. */
export async function getEmbeddedFontCss(): Promise<string> {
  if (cache) return cache;
  if (!cachePromise) {
    cachePromise = (async () => {
      const css = await fetchText(FONT_CSS_URL);
      const embedded = await inlineFontFaceUrls(css);
      cache = embedded;
      return embedded;
    })().catch((err) => {
      // Не мешаем PDF-экспорту упасть полностью из-за сети к Google
      // Fonts (шрифт — важная, но не критическая для самого факта
      // "ровно 4 страницы, весь контент присутствует" деталь) — при
      // ошибке отдаём пустую строку, документ рендерится системным
      // fallback (Arial Narrow/Arial, уже прописаны в tailwind.config.ts
      // как fallback для font-display/font-body).
      cachePromise = null;
      // eslint-disable-next-line no-console
      console.error("[pdf] getEmbeddedFontCss failed, falling back to system fonts:", err);
      return "";
    });
  }
  return cachePromise;
}
