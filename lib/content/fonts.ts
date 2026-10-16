/**
 * Шрифты, которые оператор может выбрать для текста (как список
 * "Шрифт" в Word). Только шрифты с кириллицей, которые есть и на сайте
 * (next/font, см. app/layout.tsx), и в PDF (встраиваются с Google Fonts,
 * см. lib/pdf/googleFonts.ts) — иначе в PDF текст выглядел бы не так,
 * как на экране.
 *
 * `css` ссылается на CSS-переменные, а не на имя шрифта напрямую: на
 * сайте имя шрифта подставляет next/font (хешированное), в PDF оно
 * задано вручную в renderIssueHtml.tsx — переменная одна и та же.
 */
export type FontFamilyId = "pt-sans" | "pt-sans-narrow" | "pt-serif" | "times" | "arial" | "oswald";

export type FontOption = {
  id: FontFamilyId;
  label: string;
  /** Значение CSS font-family. */
  css: string;
  /** Что запросить у Google Fonts для PDF; null — шрифт уже в базовом
   *  наборе PDF (Oswald, PT Sans) и отдельно не нужен. */
  googleSpec: string | null;
};

export const FONT_OPTIONS: FontOption[] = [
  { id: "pt-sans", label: "PT Sans", css: "var(--font-body), Arial, sans-serif", googleSpec: null },
  {
    id: "pt-sans-narrow",
    label: "PT Sans Narrow (узкий)",
    css: 'var(--font-pt-sans-narrow), "Arial Narrow", sans-serif',
    googleSpec: "PT+Sans+Narrow:wght@400;700",
  },
  {
    id: "pt-serif",
    label: "PT Serif (с засечками)",
    css: 'var(--font-pt-serif), Georgia, serif',
    googleSpec: "PT+Serif:wght@400;700",
  },
  {
    id: "times",
    label: "Как Times New Roman",
    css: 'var(--font-tinos), "Times New Roman", serif',
    googleSpec: "Tinos:wght@400;700",
  },
  {
    id: "arial",
    label: "Как Arial",
    css: 'var(--font-arimo), Arial, sans-serif',
    googleSpec: "Arimo:wght@400;700",
  },
  { id: "oswald", label: "Oswald (плакатный)", css: 'var(--font-display), "Arial Narrow", sans-serif', googleSpec: null },
];

export function fontOptionById(id: string | undefined): FontOption | undefined {
  return FONT_OPTIONS.find((f) => f.id === id);
}

/** Размеры в пунктах (как в Word). Шаблоны задают размер в px:
 *  16px = 12pt — обычный абзац. */
export const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36];

/** Готовые цвета в тон изданию. Любой другой цвет оператор выбирает
 *  отдельно (палитра телефона/компьютера). */
export const TEXT_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "#161511", label: "Чёрный" },
  { value: "#3B3E2D", label: "Тёмно-оливковый" },
  { value: "#A8281C", label: "Красный" },
  { value: "#6B6B63", label: "Серый" },
  { value: "#1F3A5F", label: "Тёмно-синий" },
];
