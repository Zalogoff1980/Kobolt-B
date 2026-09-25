import { ContentBlock, createBlockId } from "./types";
import { groupPageBlocks } from "./pageBlocks";

/**
 * Редакторская модель страницы: плоский, легко редактируемый снимок
 * содержимого страницы, производный от ContentBlock[] и обратно в
 * него конвертируемый.
 *
 * Почему не редактировать ContentBlock[] напрямую: относительный
 * порядок блоков РАЗНЫХ типов (где заголовок, где фото, где абзац)
 * не влияет на итоговую вёрстку — все шаблоны группируют блоки через
 * groupPageBlocks() по типу, а не по позиции в массиве. Значит editor
 * может держать заголовок/подзаголовок/абзацы/фото/цитату как
 * отдельные независимые списки и всегда пересобирать blocks[] заново
 * в каноническом порядке — это проще и надёжнее, чем вручную искать
 * и подменять элементы посреди смешанного массива.
 *
 * Стабильность id (шаг 8, п.13–14): title/subtitle/quote — это ровно
 * один блок каждый, но у них тоже есть свой ContentBlock.id, и он
 * должен переживать редактирование текста, а не пересоздаваться на
 * каждое нажатие клавиши. Поэтому секция хранит titleId/subtitleId/
 * quoteId — id существующего блока, если он был, иначе undefined до
 * первого sectionsToBlocks (там для него генерируется id один раз).
 */
export type PageSections = {
  title: string;
  titleId?: string;
  subtitle: string;
  subtitleId?: string;
  paragraphs: { id: string; text: string }[];
  achievements: { id: string; text: string }[];
  photos: {
    id: string;
    src: string;
    caption: string;
    personName: string;
    personRole: string;
  }[];
  quoteText: string;
  quoteAuthor: string;
  quoteId?: string;
};

export function emptySections(): PageSections {
  return {
    title: "",
    subtitle: "",
    paragraphs: [],
    achievements: [],
    photos: [],
    quoteText: "",
    quoteAuthor: "",
  };
}

/** titleLevel/subtitleLevel: страница 1 (обложка) хранит хедлайн и
 *  подзаголовок как heading level 2 / 3 (у неё нет H1 — это
 *  зарезервировано под заголовок статьи внутренних страниц);
 *  страницы 2–4 используют level 1 / 2, как и раньше. */
export function blocksToSections(
  blocks: ContentBlock[],
  levels: { titleLevel: 1 | 2; subtitleLevel: 2 | 3 }
): PageSections {
  // groupPageBlocks ищет level===1 для title и level!==1 для subtitle —
  // для обложки (titleLevel 2) это не подходит, поэтому для неё делаем
  // отдельный, более прямой разбор вместо переиспользования хелпера.
  if (levels.titleLevel === 1) {
    const g = groupPageBlocks(blocks);
    return {
      title: g.title?.text ?? "",
      titleId: g.title?.id,
      subtitle: g.subtitle?.text ?? "",
      subtitleId: g.subtitle?.id,
      paragraphs: g.paragraphs.map((p) => ({ id: p.id, text: p.text })),
      achievements: g.achievements.map((a) => ({ id: a.id, text: a.text })),
      photos: g.photos.map((p) => ({
        id: p.id,
        src: p.src,
        caption: p.caption ?? "",
        personName: p.personName ?? "",
        personRole: p.personRole ?? "",
      })),
      quoteText: g.quotes[0]?.text ?? "",
      quoteAuthor: g.quotes[0]?.author ?? "",
      quoteId: g.quotes[0]?.id,
    };
  }

  let title = "";
  let titleId: string | undefined;
  let subtitle = "";
  let subtitleId: string | undefined;
  const paragraphs: PageSections["paragraphs"] = [];
  const photos: PageSections["photos"] = [];
  let quoteText = "";
  let quoteAuthor = "";
  let quoteId: string | undefined;
  let titleFound = false;
  let subtitleFound = false;

  for (const b of blocks) {
    if (b.type === "heading" && b.level === 2 && !titleFound) {
      title = b.text;
      titleId = b.id;
      titleFound = true;
      continue;
    }
    if (b.type === "heading" && b.level === 3 && !subtitleFound) {
      subtitle = b.text;
      subtitleId = b.id;
      subtitleFound = true;
      continue;
    }
    if (b.type === "text") paragraphs.push({ id: b.id, text: b.text });
    if (b.type === "photo")
      photos.push({
        id: b.id,
        src: b.src,
        caption: b.caption ?? "",
        personName: b.personName ?? "",
        personRole: b.personRole ?? "",
      });
    if (b.type === "quote") {
      quoteText = b.text;
      quoteAuthor = b.author ?? "";
      quoteId = b.id;
    }
  }

  return {
    title,
    titleId,
    subtitle,
    subtitleId,
    paragraphs,
    achievements: [],
    photos,
    quoteText,
    quoteAuthor,
    quoteId,
  };
}

export function sectionsToBlocks(
  sections: PageSections,
  levels: { titleLevel: 1 | 2; subtitleLevel: 2 | 3 }
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if (sections.title.trim()) {
    blocks.push({
      id: sections.titleId ?? createBlockId(),
      type: "heading",
      level: levels.titleLevel,
      text: sections.title,
    });
  }
  if (sections.subtitle.trim()) {
    blocks.push({
      id: sections.subtitleId ?? createBlockId(),
      type: "heading",
      level: levels.subtitleLevel,
      text: sections.subtitle,
    });
  }
  for (const p of sections.photos) {
    if (!p.src) continue;
    blocks.push({
      id: p.id,
      type: "photo",
      src: p.src,
      caption: p.caption.trim() || undefined,
      personName: p.personName.trim() || undefined,
      personRole: p.personRole.trim() || undefined,
    });
  }
  // ВАЖНО: пустые абзацы/достижения НЕ фильтруются здесь, в отличие от
  // фото (где src структурно обязателен). Раньше пустые элементы
  // отбрасывались прямо тут — но "+ Добавить абзац" сначала добавляет
  // именно пустой элемент, а любое изменение (включая сам клик "+")
  // сразу проходит через этот round-trip в реальный Issue. Итог:
  // только что добавленное пустое поле немедленно пропадало из
  // sections при следующем blocksToSections, ещё до того, как
  // пользователь успевал в него что-то напечатать — кнопка "+
  // Добавить" выглядела нерабочей. Найдено реальным runtime QA
  // (шаг 12): поле физически не появлялось в браузере. Пустой текст
  // просто сохраняется как есть; читающие шаблоны (ArticlePhoto и
  // т.д.) при пустом тексте рендерят пустой <p> — не идеально, но не
  // ломает вёрстку, и остаётся видимым/редактируемым полем в форме.
  for (const p of sections.paragraphs) {
    blocks.push({ id: p.id, type: "text", text: p.text });
  }
  for (const a of sections.achievements) {
    blocks.push({ id: a.id, type: "text", text: a.text, variant: "achievement" });
  }
  if (sections.quoteText.trim()) {
    blocks.push({
      id: sections.quoteId ?? createBlockId(),
      type: "quote",
      text: sections.quoteText,
      author: sections.quoteAuthor.trim() || undefined,
    });
  }

  return blocks;
}
