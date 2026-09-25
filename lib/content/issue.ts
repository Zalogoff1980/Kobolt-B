import { PageContent, PageNumber, emptyPageContent } from "./types";

/** Состояние одной страницы выпуска: контент + выбранный шаблон.
 *  templateId хранится ЗДЕСЬ, отдельно от PageContent (корректировка №4) —
 *  смена шаблона переписывает только это поле, массив blocks не трогается. */
export type PageState = {
  content: PageContent;
  templateId: string | null;
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
