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
 * может держать заголовок/подзаголовок/лид/абзацы/фото/цитату как
 * отдельные независимые поля и всегда пересобирать blocks[] заново
 * в каноническом порядке — это проще и надёжнее, чем вручную искать
 * и подменять элементы посреди смешанного массива.
 *
 * Иерархия контента внутренних страниц (2–4) зафиксирована как
 * системное правило, не локальная особенность одной страницы:
 *
 *   H1 (title) → H2 (subtitle) → основной текст/лид (lead) →
 *   абзац, абзац… (paragraphs) → H3/спецэлементы, если предусмотрены
 *   шаблоном (achievements) → цитата (quote)
 *
 * lead — ЕДИНСТВЕННЫЙ вводный абзац, явно отделённый от paragraphs
 * (variant "lead" на ContentBlock, см. types.ts), а не "первый абзац
 * в списке": так его семантика не зависит ни от порядка блоков в
 * массиве, ни от того, какой из двух шаблонов страницы выбран.
 *
 * Обложка (страница 1) — ИСКЛЮЧЕНИЕ и не участвует в этой иерархии:
 * у неё нет H1/лида/абзацев вообще, только hero-заголовок (level 2),
 * подзаголовок (level 3), фото и цитата — своя, полностью отдельная
 * структура (ветка titleLevel===2 ниже). lead для обложки всегда
 * пустой и не сохраняется.
 *
 * Стабильность id (шаг 8, п.13–14): title/subtitle/lead/quote — это
 * ровно один блок каждый, но у них тоже есть свой ContentBlock.id, и
 * он должен переживать редактирование текста, а не пересоздаваться
 * на каждое нажатие клавиши. Поэтому секция хранит titleId/subtitleId/
 * leadId/quoteId — id существующего блока, если он был, иначе
 * undefined до первого sectionsToBlocks (там для него генерируется id
 * один раз).
 */
export type PageSections = {
  title: string;
  titleId?: string;
  subtitle: string;
  subtitleId?: string;
  /** Основной текст / лид — один вводный абзац сразу после
   *  подзаголовка, типографически выделяемый шаблоном. Отсутствует
   *  по смыслу для обложки (там всегда ""). */
  lead: string;
  leadId?: string;
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
    lead: "",
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
      lead: g.lead?.text ?? "",
      leadId: g.lead?.id,
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

  // Обложка: отдельная структура, без H1/лида/абзацев по смыслу.
  let title = "";
  let titleId: string | undefined;
  let subtitle = "";
  let subtitleId: string | undefined;
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
    lead: "",
    paragraphs: [],
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
  // lead — только для внутренних страниц (titleLevel===1); обложка
  // (titleLevel===2) никогда не эмитит lead-блок, даже если поле по
  // какой-то причине оказалось непустым — у неё просто нет такого
  // понятия в модели.
  if (levels.titleLevel === 1 && sections.lead.trim()) {
    blocks.push({
      id: sections.leadId ?? createBlockId(),
      type: "text",
      text: sections.lead,
      variant: "lead",
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
