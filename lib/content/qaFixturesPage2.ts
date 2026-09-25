import { Issue } from "./issue";
import { ContentBlock, createBlockId } from "./types";

/**
 * QA-фикстуры страницы 2 ("История") — три объёма контента (низкий /
 * нормальный / высокий) для Template A и Template B. Используются
 * только страницей /qa/page2, не пользовательским сценарием.
 */

const P1 = "Танковый батальон прошёл долгий путь становления. За эти годы менялась техника, менялись люди, но неизменным оставалось главное — верность делу и боевое братство.";
const P2 = "Каждое поколение танкистов привносило свой опыт, укрепляя традиции подразделения. Учения, полевые выходы и совместная служба формируют то доверие внутри экипажа, без которого невозможно выполнение ни одной боевой задачи.";
const P3 = "История батальона — это истории конкретных людей: механиков-водителей, наводчиков, командиров экипажей, которые изо дня в день оттачивают мастерство. Именно благодаря их профессионализму подразделение сохраняет высокую боевую готовность даже в самых сложных условиях.";
const P4 = "Сегодня батальон продолжает развиваться: осваивается новая техника, пересматриваются подходы к подготовке экипажей, усиливается взаимодействие между подразделениями. При этом опыт, накопленный старшими поколениями танкистов, остаётся основой, на которую опирается каждый новый набор личного состава, проходящий подготовку в части.";
const P5 = "Отдельное место в истории занимают полевые выходы в сложных погодных условиях, когда именно слаженность экипажа и выучка механика-водителя определяют исход задачи. Такие эпизоды становятся частью устной традиции подразделения и передаются от старших к молодым танкистам.";

const QUOTE = {
  text: "Опыт, накопленный годами, становится опорой для каждого нового поколения танкистов.",
  author: "Из архива части",
};

function photoSrc(seed: number) {
  const colors = ["#8a8f6f", "#4c503a", "#23241c"];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="700" height="500">
        <defs><linearGradient id="g${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient></defs>
        <rect width="700" height="500" fill="url(#g${seed})"/>
      </svg>
    `)
  );
}

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

function buildBlocks(opts: {
  paragraphs: string[];
  withQuote: boolean;
  photoCount: number;
}): ContentBlock[] {
  const blocks: ContentBlock[] = [
    block({ type: "heading", level: 1, text: "История нашего батальона" }),
    block({ type: "heading", level: 2, text: "Путь, традиции, братство" }),
  ];
  for (let i = 1; i <= opts.photoCount; i++) {
    blocks.push(
      block({ type: "photo", src: photoSrc(i), caption: `Учения экипажей, фрагмент ${i}.` })
    );
  }
  for (const p of opts.paragraphs) {
    blocks.push(block({ type: "text", text: p }));
  }
  if (opts.withQuote) {
    blocks.push(block({ type: "quote", text: QUOTE.text, author: QUOTE.author }));
  }
  return blocks;
}

function makeIssue(templateId: string, blocks: ContentBlock[]): Issue {
  const now = new Date().toISOString();
  return {
    id: `qa-page2-${templateId}-${blocks.length}`,
    number: "13",
    date: "2024-11-22",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: {
      1: { templateId: null, content: { pageNumber: 1, blocks: [] } },
      2: { templateId, content: { pageNumber: 2, blocks } },
      3: { templateId: null, content: { pageNumber: 3, blocks: [] } },
      4: { templateId: null, content: { pageNumber: 4, blocks: [] } },
    },
  };
}

const VOLUMES = {
  low: { paragraphs: [P1], withQuote: false, photoCountA: 1, photoCountB: 1 },
  normal: { paragraphs: [P1, P2, P3], withQuote: true, photoCountA: 1, photoCountB: 3 },
  high: { paragraphs: [P1, P2, P3, P4, P5], withQuote: true, photoCountA: 1, photoCountB: 5 },
};

export const qaPage2ArticlePhoto = {
  low: makeIssue(
    "article-photo-v1",
    buildBlocks({ paragraphs: VOLUMES.low.paragraphs, withQuote: VOLUMES.low.withQuote, photoCount: VOLUMES.low.photoCountA })
  ),
  normal: makeIssue(
    "article-photo-v1",
    buildBlocks({ paragraphs: VOLUMES.normal.paragraphs, withQuote: VOLUMES.normal.withQuote, photoCount: VOLUMES.normal.photoCountA })
  ),
  high: makeIssue(
    "article-photo-v1",
    buildBlocks({ paragraphs: VOLUMES.high.paragraphs, withQuote: VOLUMES.high.withQuote, photoCount: VOLUMES.high.photoCountA })
  ),
};

export const qaPage2PhotoGrid = {
  low: makeIssue(
    "photo-grid-v1",
    buildBlocks({ paragraphs: VOLUMES.low.paragraphs, withQuote: VOLUMES.low.withQuote, photoCount: VOLUMES.low.photoCountB })
  ),
  normal: makeIssue(
    "photo-grid-v1",
    buildBlocks({ paragraphs: VOLUMES.normal.paragraphs, withQuote: VOLUMES.normal.withQuote, photoCount: VOLUMES.normal.photoCountB })
  ),
  high: makeIssue(
    "photo-grid-v1",
    buildBlocks({ paragraphs: VOLUMES.high.paragraphs, withQuote: VOLUMES.high.withQuote, photoCount: VOLUMES.high.photoCountB })
  ),
};
