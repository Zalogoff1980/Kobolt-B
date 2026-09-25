import { Issue } from "./issue";
import { ContentBlock, createBlockId } from "./types";

/**
 * QA-фикстуры страницы 3 (тематический материал) — три объёма
 * контента для Template A (theme-photo-v1) и Template B
 * (theme-text-photos-v1). Используются только /qa/page3.
 */

const T1 = "Подготовка экипажа не заканчивается в учебном классе. Настоящая слаженность рождается на полигоне, где каждое действие отрабатывается до автоматизма.";
const T2 = "Механик-водитель, наводчик и командир работают как единый организм: секунды промедления в реальной задаче не прощаются, поэтому взаимодействию внутри экипажа уделяется отдельное внимание на каждом этапе подготовки.";
const T3 = "Регулярные тактические занятия позволяют отрабатывать разные сценарии — от марша по пересечённой местности до действий в условиях ограниченной видимости. Каждый выход фиксируется и разбирается со всем составом.";
const T4 = "Отдельная часть подготовки — обслуживание техники силами самого экипажа. Умение быстро диагностировать неисправность и устранить её в полевых условиях нередко определяет исход выполнения задачи.";
const T5 = "Опытные командиры отмечают: с каждым годом требования к экипажу растут, но неизменной остаётся основа — дисциплина, взаимовыручка и готовность брать на себя ответственность.";

const QUOTE = {
  text: "Экипаж — это не просто должности в машине. Это люди, которые отвечают друг за друга.",
  author: "Из беседы с командиром роты",
};

function photoSrc(seed: number) {
  const colors = ["#8a8f6f", "#4c503a", "#23241c"];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="700" height="500">
        <defs><linearGradient id="p3g${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient></defs>
        <rect width="700" height="500" fill="url(#p3g${seed})"/>
      </svg>
    `)
  );
}

/** Omit<ContentBlock, "id"> схлопывает union до общих полей (id, type) —
 *  не распределяется по вариантам, поэтому TS не видит text/level/src/etc.
 *  Дженерик T, выводимый из формы аргумента, распределяет Omit правильно. */
function block<T extends ContentBlock>(b: Omit<T, "id">): T {
  return { ...b, id: createBlockId() } as T;
}

function buildBlocks(opts: { paragraphs: string[]; withQuote: boolean; photoCount: number }): ContentBlock[] {
  const blocks: ContentBlock[] = [
    block({ type: "heading", level: 1, text: "Мастерство экипажа" }),
    block({ type: "heading", level: 2, text: "Люди, техника, результат" }),
  ];
  for (let i = 1; i <= opts.photoCount; i++) {
    blocks.push(block({ type: "photo", src: photoSrc(i), caption: `Полевые занятия, кадр ${i}.` }));
  }
  for (const p of opts.paragraphs) blocks.push(block({ type: "text", text: p }));
  if (opts.withQuote) blocks.push(block({ type: "quote", text: QUOTE.text, author: QUOTE.author }));
  return blocks;
}

function makeIssue(templateId: string, blocks: ContentBlock[]): Issue {
  const now = new Date().toISOString();
  return {
    id: `qa-page3-${templateId}-${blocks.length}`,
    number: "13",
    date: "2024-11-22",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: {
      1: { templateId: null, content: { pageNumber: 1, blocks: [] } },
      2: { templateId: null, content: { pageNumber: 2, blocks: [] } },
      3: { templateId, content: { pageNumber: 3, blocks } },
      4: { templateId: null, content: { pageNumber: 4, blocks: [] } },
    },
  };
}

const VOLUMES = {
  low: { paragraphs: [T1], withQuote: false, photoCountA: 1, photoCountB: 1 },
  normal: { paragraphs: [T1, T2, T3], withQuote: true, photoCountA: 1, photoCountB: 3 },
  high: { paragraphs: [T1, T2, T3, T4, T5], withQuote: true, photoCountA: 1, photoCountB: 3 },
};

export const qaPage3ThemePhoto = {
  low: makeIssue("theme-photo-v1", buildBlocks({ paragraphs: VOLUMES.low.paragraphs, withQuote: VOLUMES.low.withQuote, photoCount: VOLUMES.low.photoCountA })),
  normal: makeIssue("theme-photo-v1", buildBlocks({ paragraphs: VOLUMES.normal.paragraphs, withQuote: VOLUMES.normal.withQuote, photoCount: VOLUMES.normal.photoCountA })),
  high: makeIssue("theme-photo-v1", buildBlocks({ paragraphs: VOLUMES.high.paragraphs, withQuote: VOLUMES.high.withQuote, photoCount: VOLUMES.high.photoCountA })),
};

export const qaPage3ThemeTextPhotos = {
  low: makeIssue("theme-text-photos-v1", buildBlocks({ paragraphs: VOLUMES.low.paragraphs, withQuote: VOLUMES.low.withQuote, photoCount: VOLUMES.low.photoCountB })),
  normal: makeIssue("theme-text-photos-v1", buildBlocks({ paragraphs: VOLUMES.normal.paragraphs, withQuote: VOLUMES.normal.withQuote, photoCount: VOLUMES.normal.photoCountB })),
  high: makeIssue("theme-text-photos-v1", buildBlocks({ paragraphs: VOLUMES.high.paragraphs, withQuote: VOLUMES.high.withQuote, photoCount: VOLUMES.high.photoCountB })),
};
