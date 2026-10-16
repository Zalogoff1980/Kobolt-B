import type { Metadata, Viewport } from "next";
import { Arimo, Oswald, PT_Sans, PT_Sans_Narrow, PT_Serif, Tinos } from "next/font/google";
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

/* Дополнительные шрифты для выбора в редакторе ("Шрифт", как в Word) —
   см. lib/content/fonts.ts. preload: false — браузер скачивает их, только
   если выбранный шрифт реально используется в тексте, а не на каждой
   странице приложения. */
const ptSansNarrow = PT_Sans_Narrow({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans-narrow",
  display: "swap",
  preload: false,
});

const ptSerif = PT_Serif({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
  display: "swap",
  preload: false,
});

const tinos = Tinos({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "700"],
  variable: "--font-tinos",
  display: "swap",
  preload: false,
});

const arimo = Arimo({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "700"],
  variable: "--font-arimo",
  display: "swap",
  preload: false,
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
    <html lang="ru" className={`${oswald.variable} ${ptSans.variable} ${ptSansNarrow.variable} ${ptSerif.variable} ${tinos.variable} ${arimo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
