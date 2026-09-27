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
 * Стабильность id (шаг 8, п.13–14): title/subtitle/lead — это ровно
 * один блок каждый, но у них тоже есть свой ContentBlock.id, и он
 * должен переживать редактирование текста, а не пересоздаваться на
 * каждое нажатие клавиши. Поэтому секция хранит titleId/subtitleId/
 * leadId — id существующего блока, если он был, иначе undefined до
 * первого sectionsToBlocks (там для него генерируется id один раз).
 * quotes — уже список (сколько угодно цитат), поэтому каждая запись
 * несёт свой id прямо в себе, тем же приёмом, что paragraphs/
 * achievements/birthdays.
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
  /** "Наши именинники" — только у Template B страницы 2 (photo-grid-v1,
   *  найдено QA). Отдельный список от achievements: три поля на запись,
   *  а не одна строка. */
  birthdays: { id: string; name: string; date: string; message: string }[];
  photos: {
    id: string;
    src: string;
    caption: string;
    personName: string;
    personRole: string;
    /** Короткая цитата и описание конкретного человека — карточка
     *  "Лица батальона" (макет-референс, сентябрь 2026). */
    personQuote: string;
    personBio: string;
    /** Награды (id из реестра components/decorative/awards/registry.tsx),
     *  выбранные для этого человека — страница "Лица батальона". */
    awardIds: string[];
  }[];
  /** Цитаты страницы — сколько угодно (QA: "дать возможность добавлять
   *  такой блок сколько нужно"; раньше — не больше одной, все шаблоны
   *  читали только quotes[0]/firstOfType). Тот же список-паттерн, что
   *  и у paragraphs/achievements/birthdays. */
  quotes: { id: string; text: string; author: string }[];
};

export function emptySections(): PageSections {
  return {
    title: "",
    subtitle: "",
    lead: "",
    paragraphs: [],
    achievements: [],
    birthdays: [],
    photos: [],
    quotes: [],
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
      birthdays: g.birthdays.map((b) => ({
        id: b.id,
        name: b.name,
        date: b.date,
        message: b.message ?? "",
      })),
      photos: g.photos.map((p) => ({
        id: p.id,
        src: p.src,
        caption: p.caption ?? "",
        personName: p.personName ?? "",
        personRole: p.personRole ?? "",
        personQuote: p.personQuote ?? "",
        personBio: p.personBio ?? "",
        awardIds: p.awardIds ?? [],
      })),
      quotes: g.quotes.map((q) => ({ id: q.id, text: q.text, author: q.author ?? "" })),
    };
  }

  // Обложка: отдельная структура, без H1/лида по смыслу — но
  // произвольный текстовый блок (paragraphs) обложке ЕСТЬ смысл иметь
  // (найдено QA: hero-колонка выглядит пусто, когда нет цитаты и мало
  // материала) — это та же зона "paragraph", что и на внутренних
  // страницах, просто отдельная обложечная раскладка (cover-v2) сама
  // решает, где и как её показать (см. HeroMedia/CoverV2).
  let title = "";
  let titleId: string | undefined;
  let subtitle = "";
  let subtitleId: string | undefined;
  const paragraphs: PageSections["paragraphs"] = [];
  const photos: PageSections["photos"] = [];
  const quotes: PageSections["quotes"] = [];
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
        personQuote: b.personQuote ?? "",
        personBio: b.personBio ?? "",
        awardIds: b.awardIds ?? [],
      });
    if (b.type === "text" && (!b.variant || b.variant === "paragraph")) {
      paragraphs.push({ id: b.id, text: b.text });
    }
    if (b.type === "quote") {
      quotes.push({ id: b.id, text: b.text, author: b.author ?? "" });
    }
  }

  return {
    title,
    titleId,
    subtitle,
    subtitleId,
    lead: "",
    paragraphs,
    achievements: [],
    birthdays: [],
    photos,
    quotes,
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
      personQuote: p.personQuote.trim() || undefined,
      personBio: p.personBio.trim() || undefined,
      awardIds: p.awardIds.length > 0 ? p.awardIds : undefined,
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
  for (const b of sections.birthdays) {
    blocks.push({
      id: b.id,
      type: "birthday",
      name: b.name,
      date: b.date,
      message: b.message.trim() || undefined,
    });
  }
  // Как и абзацы/достижения — пустой текст не фильтруется здесь (см.
  // комментарий выше про paragraphs): "+ Добавить цитату" сначала
  // добавляет пустую запись, и она должна остаться видимой/
  // редактируемой формой, а не исчезать при следующей пересборке.
  for (const q of sections.quotes) {
    blocks.push({
      id: q.id,
      type: "quote",
      text: q.text,
      author: q.author.trim() || undefined,
    });
  }

  return blocks;
}
