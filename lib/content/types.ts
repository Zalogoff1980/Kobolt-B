import type { CSSProperties } from "react";
import { FontFamilyId, fontOptionById } from "./fonts";

/**
 * Модель контента КОБОЛЬТ-Б.
 *
 * Принцип (ТЗ п.16): контент и дизайн разделены полностью.
 * Этот файл описывает ТОЛЬКО контент. Ничего о раскладке, шрифтах,
 * координатах или CSS здесь быть не должно — это зона lib/templates
 * (появится на следующих шагах).
 */

/** Стабильный идентификатор блока — не пересчитывается при смене шаблона.
 *  Нужен, чтобы при перепривязке контента к слотам нового шаблона
 *  (см. корректировку №3) можно было надёжно сопоставить блок слоту,
 *  а не полагаться на порядковый индекс в массиве. */
export type BlockId = string;

export function createBlockId(): BlockId {
  // crypto.randomUUID доступен и в браузере, и в Node 18+ (сборка Vercel).
  return crypto.randomUUID();
}

/** Выравнивание текста, как в Word: слева, по центру, справа, по ширине.
 *  Нет значения (undefined) = как задумано шаблоном (слева). Это
 *  свойство содержимого — выбор оператора, а не раскладки, поэтому
 *  живёт в блоке и переживает смену шаблона страницы. */
export type TextAlign = "left" | "center" | "right" | "justify";

export const TEXT_ALIGN_OPTIONS: { id: TextAlign; label: string }[] = [
  { id: "left", label: "По левому краю" },
  { id: "center", label: "По центру" },
  { id: "right", label: "По правому краю" },
  { id: "justify", label: "По ширине" },
];

/** Оформление шрифта, как на панели "Шрифт" в Word. Любое поле можно не
 *  задавать — тогда действует то, что задумано шаблоном. Как и
 *  выравнивание, это свойство содержимого (выбор оператора): оно
 *  переживает смену шаблона страницы. */
export type TextFormat = {
  fontFamily?: FontFamilyId;
  /** Размер в пунктах (pt), как в Word. */
  fontSize?: number;
  /** Цвет в виде "#rrggbb". */
  color?: string;
  /** true — жирный, false — обычный (даже там, где шаблон делает жирным),
   *  не задано — как в шаблоне. */
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

/** Убирает пустые поля; если ничего не осталось — undefined, чтобы в
 *  выпуске не копились пустые объекты. */
export function cleanTextFormat(f: TextFormat): TextFormat | undefined {
  const out: TextFormat = {};
  if (f.fontFamily) out.fontFamily = f.fontFamily;
  if (f.fontSize) out.fontSize = f.fontSize;
  if (f.color) out.color = f.color;
  if (f.bold !== undefined) out.bold = f.bold;
  if (f.italic) out.italic = true;
  if (f.underline) out.underline = true;
  return Object.keys(out).length > 0 ? out : undefined;
}

/** inline-стиль для шаблонов: ничего не меняет, пока оператор ничего не
 *  выбрал (старые выпуски выглядят как раньше). */
export function textStyle(align?: TextAlign, format?: TextFormat): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (align) style.textAlign = align;
  if (format) {
    const font = fontOptionById(format.fontFamily);
    if (font) style.fontFamily = font.css;
    if (format.fontSize) style.fontSize = `${format.fontSize}pt`;
    if (format.color) style.color = format.color;
    if (format.bold !== undefined) style.fontWeight = format.bold ? 700 : 400;
    if (format.italic) style.fontStyle = "italic";
    if (format.underline) style.textDecoration = "underline";
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

export type ContentBlock =
  | { id: BlockId; type: "heading"; level: 1 | 2 | 3; text: string; align?: TextAlign; format?: TextFormat }
  | {
      id: BlockId;
      type: "text";
      text: string;
      align?: TextAlign;
      format?: TextFormat;
      /** Семантическая роль текстового блока — не порядок в массиве,
       *  а явное поле, поэтому смысл текста не зависит от того, где
       *  блок физически лежит в blocks[] (найденная проблема:
       *  H1/H2/основной текст/абзацы смешивались именно потому, что
       *  различались только позицией).
       *  "lead" — единственный вводный абзац/лид сразу после
       *  заголовков (заполняется отдельным полем "Основной текст" в
       *  редакторе, шаблон выделяет его типографически).
       *  "achievement" — короткая строка-достижение/награда (страница
       *  "Лица батальона"), выводится отдельным компактным списком.
       *  Без значения — обычный абзац тела статьи. */
      variant?: "paragraph" | "lead" | "achievement";
    }
  | {
      id: BlockId;
      type: "photo";
      /** Data URL или blob-ссылка на локально загруженное фото (MVP: без сервера). */
      src: string;
      caption?: string;
      /** Имя и должность/позывной человека на фото (страница "Лица
       *  батальона"). Опционально и не используется другими страницами. */
      personName?: string;
      personRole?: string;
      /** Короткая цитата человека — реплика в "пузыре" рядом с фото
       *  (QA: макет-референс "Лица батальона" с карточками людей,
       *  сентябрь 2026). Своё поле, а не общий page-level quote-блок:
       *  привязана именно к этому человеку, а не к странице целиком. */
      personQuote?: string;
      /** Краткое описание/био под фото (тот же референс — абзац под
       *  жирной ролью "Командир танка."). Тоже привязано к конкретному
       *  человеку, а не к общим paragraphs страницы. */
      personBio?: string;
      /** Награды человека на фото — id из реестра наград (см.
       *  components/decorative/awards/registry.tsx), а не свободный
       *  текст: те же значки показываются одинаково на всех фото, где
       *  выбраны, поэтому библиотека изображений — единственный
       *  источник истины, как и у фоновых гравюр (PRIORITY 6). Как и
       *  personName/personRole, используется только страницей "Лица
       *  батальона" — остальные шаблоны это поле просто не читают. */
      awardIds?: string[];
    }
  | { id: BlockId; type: "quote"; text: string; author?: string }
  | {
      id: BlockId;
      type: "birthday";
      /** Блок "Наши именинники" (Template B страницы 2, photo-grid-v1,
       *  QA: "справа... разместить блок наши именинники... с
       *  возможностью добавить несколько фамилий с датой... и текстом
       *  небольшого поздравления"). Структурная запись (не просто
       *  строка, как achievement) — три отдельных поля, а не один текст
       *  с самодельным разделителем, чтобы шаблон мог оформить дату и
       *  поздравление типографически по-разному. */
      name: string;
      /** Как ввёл пользователь ("28 сентября", "12.10") — без парсинга,
       *  как и Issue.number. */
      date: string;
      message?: string;
    };

/** Номер страницы выпуска. Раньше было закрытое 1|2|3|4 — выпуск был
 *  жёстко зашит на ровно 4 страницы. QA: "возможность добавить новую
 *  страницу... без жёсткого лимита" — страница 1 всегда обложка,
 *  страницы 2–4 сохраняют свои фирменные шаблоны ("История", тема,
 *  "Лица"), а любая страница 5+ — "внутренняя полоса" с тем же набором
 *  шаблонов, что у страницы 3 (см. A4Page.tsx, templateOptionsFor). */
export type PageNumber = number;

/** Контент одной страницы выпуска. templateId сюда НЕ входит —
 *  он живёт в PageState (см. issue.ts), чтобы смена шаблона
 *  никогда не требовала трогать blocks. */
export type PageContent = {
  pageNumber: PageNumber;
  blocks: ContentBlock[];
};

export function emptyPageContent(pageNumber: PageNumber): PageContent {
  return { pageNumber, blocks: [] };
}
