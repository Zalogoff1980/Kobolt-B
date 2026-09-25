import { ContentBlock } from "./types";

type HeadingBlock = Extract<ContentBlock, { type: "heading" }>;
type TextBlock = Extract<ContentBlock, { type: "text" }>;
type PhotoBlock = Extract<ContentBlock, { type: "photo" }>;
type QuoteBlock = Extract<ContentBlock, { type: "quote" }>;

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
export function groupPageBlocks(blocks: ContentBlock[]) {
  let title: HeadingBlock | undefined;
  let subtitle: HeadingBlock | undefined;
  const paragraphs: TextBlock[] = [];
  /** Текстовые блоки с variant "achievement" (страница "Лица
   *  батальона") — отделены от paragraphs, чтобы шаблон мог вывести
   *  их отдельным компактным списком, а не как абзацы статьи. */
  const achievements: TextBlock[] = [];
  const photos: PhotoBlock[] = [];
  const quotes: QuoteBlock[] = [];

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
      (block.variant === "achievement" ? achievements : paragraphs).push(block);
    }
    if (block.type === "photo") photos.push(block);
    if (block.type === "quote") quotes.push(block);
  }

  return { title, subtitle, paragraphs, achievements, photos, quotes };
}
