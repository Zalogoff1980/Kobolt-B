import { PageContent, PageNumber, emptyPageContent } from "./types";

/**
 * PRIORITY 6 — разделение "что и как расположено" (Layout Template) и
 * "что нарисовано на фоне" (Background Engraving):
 *
 *   Issue
 *    └── Page
 *         ├── Layout Template   — grid/placement/content zones/columns/
 *         │                       photo & text areas/размеры — то,
 *         │                       чем управляет templateId.
 *         ├── Content           — PageContent (blocks) — не меняется.
 *         └── Background Engraving — ТОЛЬКО фоновая иллюстрация/
 *                                     декоративная композиция; никогда
 *                                     не влияет на layout/content и
 *                                     наоборот (см. BackgroundEngraving.tsx
 *                                     и components/decorative/engravings/registry.tsx).
 *
 * `backgroundEngravingId` — сейчас реализовано для страницы 1
 * (обложка, 4 готовых варианта — components/decorative/engravings/coverArt.tsx),
 * страницы 2–4 пока не имеют доступных вариантов (полная библиотека
 * абстрактных line-art мотивов подготовлена в motifs.tsx, но
 * сознательно не подключена — следующий этап). Поле опционально, чтобы
 * уже сохранённые в IndexedDB Issue (без этого поля вовсе) оставались
 * валидными без миграции — его отсутствие равносильно `null`. */
export type PageState = {
  content: PageContent;
  /** Layout Template этой страницы — grid/placement/content
   *  zones/columns/photo & text areas (ТЗ шага 7, п.4; PRIORITY 6).
   *  Хранится ОТДЕЛЬНО от PageContent (корректировка №4) — смена
   *  шаблона переписывает только это поле, массив blocks не трогается. */
  templateId: string | null;
  /** PRIORITY 6 — см. комментарий типа выше. Хранится и меняется
   *  ОТДЕЛЬНО от templateId и content: EngravingPicker (редактор)
   *  переписывает только это поле, ничего больше. */
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
  /** Базовый комплект: обложка (1), "История" (2), тематическая
   *  страница (3), "Лица батальона" (4) — присутствуют всегда. Сверх
   *  них оператор может добавлять ещё страницы (QA: "возможность
   *  добавить новую страницу... без жёсткого лимита") — они живут в
   *  этом же объекте под своими номерами (5, 6, …), используют тот же
   *  набор "внутренних" шаблонов, что и страница 3 (см. A4Page.tsx). */
  pages: Record<PageNumber, PageState>;
  /** Блок "Новости" на обложке (cover-v1) — короткие заметки под
   *  списком "В номере" (найдено QA: "разместим блок новости... одним
   *  текстом с несколькими переносами сделаем в несколько абзацев").
   *  Намеренно НЕ часть ContentBlock/PageContent страницы 1 — это не
   *  редакционный материал конкретной страницы, а отдельный
   *  элемент оформления обложки, поэтому живёт как отдельное поле
   *  выпуска, не завязанное на групировку/шаблоны блоков. Хранится как
   *  сырой текст: каждая непустая строка — одна новость, разбиение при
   *  отрисовке (см. NewsBlock.tsx). Опционально — старые Issue без
   *  этого поля остаются валидными без миграции. */
  coverNews?: string | null;
  /** Блок "День в истории" на обложке cover-v2 ("Боевой листок") —
   *  заменяет собой текстовый список "В номере" в ContentsGrid (найдено
   *  QA: список заголовков страниц слева и подписи под миниатюрами
   *  справа в одном блоке дублировали друг друга — "два одинаковых
   *  блока в разной степени содержания"). Миниатюры страниц справа
   *  остаются как есть (там уже есть подписи-заголовки — второй раз их
   *  показывать слева было незачем), а освободившееся место занимают
   *  исторические факты дня выпуска. Как и coverNews — намеренно НЕ
   *  часть ContentBlock/PageContent страницы 1, сырой текст, каждая
   *  непустая строка — один факт (см. splitLines в lib/content/textLines.ts,
   *  общий разбор для этого поля и для coverNews). Опционально — старые
   *  Issue без этого поля остаются валидными без миграции. */
  dayInHistory?: string | null;
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
    coverNews: null,
    dayInHistory: null,
    pages: {
      1: { content: emptyPageContent(1), templateId: "cover-v1" },
      2: { content: emptyPageContent(2), templateId: null },
      3: { content: emptyPageContent(3), templateId: null },
      4: { content: emptyPageContent(4), templateId: null },
    },
  };
}
