import { ContentBlock } from "./types";

type HeadingBlock = Extract<ContentBlock, { type: "heading" }>;
type TextBlock = Extract<ContentBlock, { type: "text" }>;
type PhotoBlock = Extract<ContentBlock, { type: "photo" }>;
type QuoteBlock = Extract<ContentBlock, { type: "quote" }>;
type BirthdayBlock = Extract<ContentBlock, { type: "birthday" }>;

/**
 * Раскладывает произвольный набор ContentBlock внутренней страницы на
 * именованные группы, которыми оперируют шаблоны (Template A/B).
 * Единая логика группировки для всех шаблонов страницы — при
 * добавлении нового шаблона внутренней страницы её не нужно повторять.
 *
 * Соглашение: первый heading уровня 1 — заголовок (H1) страницы;
 * первый heading уровня 2 или 3 после него — подзаголовок. Остальные
 * heading-блоки (если появятся) уходят в тело статьи как текстовые
 * акценты — шаблон сам решает, показывать ли их отдельно.
 */
/**
 * Целевая иерархия контента внутренней страницы (зафиксирована как
 * системное правило, не локальная особенность одной страницы):
 *
 *   H1 (title) → H2 (subtitle) → основной текст/лид (lead) →
 *   абзац, абзац… (paragraphs) → H3/спецэлементы, если предусмотрены
 *   шаблоном (achievements) → цитата (quotes)
 *
 * Каждая роль — отдельное явное поле, а не позиция в массиве: lead
 * определяется через ContentBlock.variant==="lead", а не "первый
 * текстовый блок по счёту". Благодаря этому смысл текста не зависит
 * от того, в каком порядке блоки физически лежат в blocks[], и не
 * меняется при смене шаблона страницы (оба шаблона одной страницы
 * читают одну и ту же группировку).
 */
export function groupPageBlocks(blocks: ContentBlock[]) {
  let title: HeadingBlock | undefined;
  let subtitle: HeadingBlock | undefined;
  /** Единственный вводный абзац/лид — поле "Основной текст" в
   *  редакторе, идёт в модели сразу после подзаголовка. */
  let lead: TextBlock | undefined;
  const paragraphs: TextBlock[] = [];
  /** Текстовые блоки с variant "achievement" (страница "Лица
   *  батальона") — отделены от paragraphs, чтобы шаблон мог вывести
   *  их отдельным компактным списком, а не как абзацы статьи. */
  const achievements: TextBlock[] = [];
  const photos: PhotoBlock[] = [];
  const quotes: QuoteBlock[] = [];
  const birthdays: BirthdayBlock[] = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      if (!title && block.level === 1) {
        title = block;
        continue;
      }
      if (!subtitle && block.level !== 1) {
        subtitle = block;
        continue;
      }
    }
    if (block.type === "text") {
      if (block.variant === "achievement") {
        achievements.push(block);
      } else if (block.variant === "lead" && !lead) {
        lead = block;
      } else {
        paragraphs.push(block);
      }
    }
    if (block.type === "photo") photos.push(block);
    if (block.type === "quote") quotes.push(block);
    if (block.type === "birthday") birthdays.push(block);
  }

  return { title, subtitle, lead, paragraphs, achievements, photos, quotes, birthdays };
}
