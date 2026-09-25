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

export type ContentBlock =
  | { id: BlockId; type: "heading"; level: 1 | 2 | 3; text: string }
  | {
      id: BlockId;
      type: "text";
      text: string;
      /** "achievement" — короткая строка-достижение/награда (страница
       *  "Лица батальона"), выводится отдельным компактным списком, а
       *  не как абзац статьи. Без значения — обычный абзац, как и
       *  раньше на всех остальных страницах. */
      variant?: "paragraph" | "achievement";
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
    }
  | { id: BlockId; type: "quote"; text: string; author?: string };

export type PageNumber = 1 | 2 | 3 | 4;

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
