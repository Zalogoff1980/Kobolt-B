import type { Metadata, Viewport } from "next";
import { Oswald, PT_Sans } from "next/font/google";
import "@/styles/globals.css";

/**
 * Шрифты (корректировка №6).
 *
 * next/font/google скачивает файлы шрифтов один раз на этапе сборки и
 * хостит их как статику самого приложения (self-hosted) — рантайм не
 * обращается к Google Fonts ни в браузере, ни в headless Chromium при
 * рендере PDF. Это даёт идентичный результат в Preview и в PDF без
 * внешних сетевых запросов на этапе печати.
 *
 * Oswald — плотный display-гротеск с полной поддержкой кириллицы,
 * даёт нужную "плакатность" для H1/H2 (см. референсы).
 * PT Sans — читаемый гротеск с кириллицей для основного текста и
 * подписей; в паре с Oswald даёт редакционный, а не декоративный вид.
 */
const oswald = Oswald({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const ptSans = PT_Sans({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "КОБОЛЬТ-Б",
  description: "Конструктор внутреннего боевого листка танкового батальона",
};

// Без этого браузер на мобильном разрешает жест pinch-to-zoom/double-tap
// зуммировать всю страницу целиком (QA: "нигде не должен быть ресайз
// страницы кроме как в превью... редактор, стартовая страница жестом не
// ресайзить") — стартовый экран и редактор верстают фиксированный UI,
// произвольный зум браузера ломает раскладку. Единственное место, где
// страница действительно меняет масштаб — сама A4-страница внутри
// превью (PagePreviewScaler) — но это программный CSS transform: scale
// по ширине контейнера, а не жест зума браузера, поэтому запрет
// pinch-zoom его не касается и продолжает работать как раньше.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${oswald.variable} ${ptSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
