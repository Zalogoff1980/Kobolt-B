import { Issue } from "./issue";
import { ContentBlock, createBlockId } from "./types";
import type { ContentsEntry } from "@/components/templates/cover/ContentsBlock";

/**
 * QA-фикстуры для проверки адаптивности шаблона cover-v1 (не часть
 * пользовательского сценария — используются только страницей /qa/cover).
 *
 * Состояние A — минимум контента: нет фото, нет заголовка, нет цитаты,
 * страница 2 ещё пустая. Проверяем, что макет не выглядит "сломанным"
 * при почти полном отсутствии материала (ТЗ п.4).
 *
 * Состояние B — нормальное заполнение: реальное фото (синтетическая
 * заглушка — в этой среде нет доступа в интернет за настоящим снимком,
 * но объектная подгонка/подпись/градиент проверяются идентично
 * настоящему JPEG), заголовок и цитата заметной длины, страница 2 —
 * с длинным заголовком, чтобы проверить перенос строк в "В номере".
 */

const QA_PHOTO_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="650">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="#9aa07a"/>
          <stop offset="45%" stop-color="#565a3f"/>
          <stop offset="100%" stop-color="#1c1d16"/>
        </linearGradient>
        <radialGradient id="v" cx="50%" cy="35%" r="75%">
          <stop offset="60%" stop-color="#000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
        </radialGradient>
      </defs>
      <rect width="900" height="650" fill="url(#g)"/>
      <rect width="900" height="650" fill="url(#v)"/>
    </svg>
  `);

const QA_THUMB_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="220">
      <rect width="300" height="220" fill="#4c503a"/>
    </svg>
  `);

/** Первая попытка (generic T extends ContentBlock c Omit<T,"id"> как типом
 *  параметра) не работала: TS не всегда выводит конкретный член union из
 *  объектного литерала, когда Omit стоит прямо в позиции параметра —
 *  инференс падал обратно на весь ContentBlock, и снова схлопывался до
 *  общих полей. Рабочий паттерн — перегрузки: каждая заранее сужает
 *  ContentBlock до одного варианта через Extract ДО применения Omit,
 *  так что Omit в каждой перегрузке уже не над union, а над обычным
 *  объектным типом, и работает как обычно. */
function block(b: Omit<Extract<ContentBlock, { type: "heading" }>, "id">): Extract<ContentBlock, { type: "heading" }>;
function block(b: Omit<Extract<ContentBlock, { type: "text" }>, "id">): Extract<ContentBlock, { type: "text" }>;
function block(b: Omit<Extract<ContentBlock, { type: "photo" }>, "id">): Extract<ContentBlock, { type: "photo" }>;
function block(b: Omit<Extract<ContentBlock, { type: "quote" }>, "id">): Extract<ContentBlock, { type: "quote" }>;
function block(b: any): ContentBlock {
  return { ...b, id: createBlockId() };
}

const base: Pick<Issue, "number" | "date" | "status" | "createdAt" | "updatedAt"> = {
  number: "13",
  date: "2024-11-22",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const qaIssueStateA: Issue = {
  ...base,
  id: "qa-state-a",
  pages: {
    1: { templateId: "cover-v1", content: { pageNumber: 1, blocks: [] } },
    2: { templateId: null, content: { pageNumber: 2, blocks: [] } },
    3: { templateId: null, content: { pageNumber: 3, blocks: [] } },
    4: { templateId: null, content: { pageNumber: 4, blocks: [] } },
  },
};

export const qaIssueStateB: Issue = {
  ...base,
  id: "qa-state-b",
  pages: {
    1: {
      templateId: "cover-v1",
      content: {
        pageNumber: 1,
        blocks: [
          block({
            type: "photo",
            src: QA_PHOTO_SRC,
            caption: "Плановые учения экипажей на полигоне, ноябрь 2024 года.",
          }),
          block({
            type: "heading",
            level: 2,
            text: "Готовы выполнить задачу в любых условиях",
          }),
          block({
            type: "quote",
            text: "Слаженность экипажа — это не удача, а результат ежедневной работы и доверия.",
            author: "Командир танкового батальона",
          }),
        ],
      },
    },
    2: {
      templateId: null,
      content: {
        pageNumber: 2,
        blocks: [
          block({
            type: "heading",
            level: 1,
            text: "История батальона: традиции, преемственность и путь, который продолжается",
          }),
        ],
      },
    },
    3: { templateId: null, content: { pageNumber: 3, blocks: [] } },
    4: { templateId: null, content: { pageNumber: 4, blocks: [] } },
  },
};

/** Отдельный, изолированный тест "В номере" с 2–3 пунктами разной
 *  длины (текущая модель Issue поддерживает только страницы 1–2 —
 *  см. lib/content/issue.ts, — поэтому набор из трёх пунктов собран
 *  напрямую как ContentsEntry[], а не через полноценный Issue).
 *  Специально смешаны длинный заголовок, короткий с миниатюрой и
 *  пустой пункт — три разных состояния компонента одновременно. */
export const qaContentsVariants: ContentsEntry[] = [
  {
    pageNumber: 2,
    title: "История батальона: традиции, преемственность и путь, который продолжается",
  },
  {
    pageNumber: 3,
    title: "Люди. Опыт. Результат.",
    thumbnailSrc: QA_THUMB_SRC,
  },
  {
    pageNumber: 4,
  },
];
