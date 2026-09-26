import { PageContent, PageNumber, emptyPageContent } from "./types";

/**
 * PRIORITY 6 — архитектурная подготовка (без реализации): разделение
 * "что и как расположено" (Layout Template) и "что нарисовано на фоне"
 * (Background Engraving) — это НЕ два независимых поля прямо сейчас
 * (реализация нескольких сотен вариантов гравюр — отдельный, более
 * поздний этап, явно отложенный в ТЗ), а фиксация будущей формы:
 *
 *   Issue
 *    └── Page
 *         ├── Layout Template   — grid/placement/content zones/columns/
 *         │                       photo & text areas/размеры — то,
 *         │                       чем СЕГОДНЯ уже управляет templateId.
 *         ├── Content           — PageContent (blocks) — не меняется.
 *         └── Background Engraving — ТОЛЬКО фоновая иллюстрация/
 *                                     декоративная композиция; никогда
 *                                     не влияет на layout/content и
 *                                     наоборот.
 *
 * `backgroundEngravingId` — зарезервированное, пока всегда `null`/не
 * читаемое ничем поле. Как только появится реальная библиотека
 * гравюр (~16 вариантов, отложено), сюда добавится её выбор, точно
 * так же отдельно от templateId, как templateId сегодня отделён от
 * content (см. комментарий поля ниже) — само появление этого поля не
 * требует менять ни один существующий шаблон или сохранённый Issue:
 * его отсутствие в старых записях IndexedDB равносильно `null`. */
export type PageState = {
  content: PageContent;
  /** Layout Template этой страницы — grid/placement/content
   *  zones/columns/photo & text areas (ТЗ шага 7, п.4; PRIORITY 6).
   *  Хранится ОТДЕЛЬНО от PageContent (корректировка №4) — смена
   *  шаблона переписывает только это поле, массив blocks не трогается. */
  templateId: string | null;
  /** PRIORITY 6, задел на будущее — см. комментарий типа выше.
   *  Не читается и не пишется нигде в текущем коде; опционально,
   *  чтобы уже сохранённые в IndexedDB Issue (без этого поля вовсе)
   *  оставались валидными без миграции. */
  backgroundEngravingId?: string | null;
};

export type IssueStatus = "draft" | "ready";

export type Issue = {
  id: string;
  number: string; // "№ 12" — храним как ввёл пользователь, без парсинга
  date: string; // ISO-дата, форматируется под "15 НОЯБРЯ 2024" при рендере
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  /** Полный комплект вертикального слайса: обложка (1), "История" (2),
   *  тематическая страница (3), "Лица батальона" (4) — все 4 страницы
   *  выпуска по ТЗ. */
  pages: Record<PageNumber, PageState>;
};

export function createIssue(params: { number: string; date: string }): Issue {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    number: params.number,
    date: params.date,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: {
      1: { content: emptyPageContent(1), templateId: "cover-v1" },
      2: { content: emptyPageContent(2), templateId: null },
      3: { content: emptyPageContent(3), templateId: null },
      4: { content: emptyPageContent(4), templateId: null },
    },
  };
}
