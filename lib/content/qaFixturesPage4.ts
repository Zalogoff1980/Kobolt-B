import { Issue } from "./issue";
import { ContentBlock, createBlockId } from "./types";

/**
 * QA-фикстуры страницы 4 ("Лица батальона") — Template A
 * (person-feature-v1) и Template B (team-faces-v1). Используются
 * только /qa/page4, не пользовательским сценарием.
 */

function photoSrc(seed: number, tone: "warm" | "cool" = "warm") {
  const palettes = {
    warm: ["#9a8f6f", "#54503a", "#241f16"],
    cool: ["#7f8a8f", "#3c4650", "#181c20"],
  };
  const colors = palettes[tone];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="650">
        <defs><linearGradient id="p4g${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient></defs>
        <rect width="500" height="650" fill="url(#p4g${seed})"/>
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

function emptyPages(exceptPage4: ContentBlock[]) {
  return {
    1: { templateId: null, content: { pageNumber: 1 as const, blocks: [] } },
    2: { templateId: null, content: { pageNumber: 2 as const, blocks: [] } },
    3: { templateId: null, content: { pageNumber: 3 as const, blocks: [] } },
    4: { templateId: "" , content: { pageNumber: 4 as const, blocks: exceptPage4 } },
  };
}

function makeIssue(templateId: string, blocks: ContentBlock[], idSuffix: string): Issue {
  const now = new Date().toISOString();
  const pages = emptyPages(blocks);
  pages[4].templateId = templateId;
  return {
    id: `qa-page4-${idSuffix}`,
    number: "13",
    date: "2024-11-22",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages,
  };
}

// ---- Template A ("Лицо") ----

const A_TEXT_SHORT = "Служит в батальоне третий год. Отвечает за подготовку и техническое состояние машины перед каждым выходом.";
const A_TEXT_2 = "За время службы зарекомендовал себя как внимательный и дисциплинированный специалист, которому доверяют самые ответственные задачи.";
const A_TEXT_3 = "Сослуживцы отмечают спокойствие и хладнокровие в сложных ситуациях — качества, которые не раз помогали экипажу выполнить задачу без потерь времени и ресурсов.";
const A_TEXT_4 = "Свободное время посвящает наставничеству: делится опытом с молодыми танкистами, помогает им быстрее освоиться в экипаже и понять специфику работы на технике.";
const A_TEXT_5 = "По словам командира роты, именно такие специалисты формируют костяк подразделения — на них можно положиться в любых условиях, и именно они передают традиции следующим поколениям.";

const A_QUOTE = { text: "Машину можно починить, а вот настоящую команду нужно беречь.", author: "" };

export const qaPage4PersonFeature = {
  low: makeIssue("person-feature-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({ type: "photo", src: photoSrc(1), personName: "И. Петров", personRole: "Наводчик" }),
    block({ type: "text", text: A_TEXT_SHORT }),
  ], "A-low"),
  normal: makeIssue("person-feature-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({
      type: "photo",
      src: photoSrc(2),
      personName: "Старший сержант Иванов Алексей Сергеевич",
      personRole: "Командир танка",
    }),
    block({ type: "text", text: A_TEXT_SHORT }),
    block({ type: "text", text: A_TEXT_2 }),
    block({ type: "text", text: A_TEXT_3 }),
    block({ type: "quote", text: A_QUOTE.text }),
  ], "A-normal"),
  high: makeIssue("person-feature-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({
      type: "photo",
      src: photoSrc(3),
      personName: "Гвардии старший сержант Сидоров Максим Андреевич",
      personRole: "Младший сержант, наводчик-оператор, позывной «Сокол»",
    }),
    block({ type: "text", text: A_TEXT_SHORT }),
    block({ type: "text", text: A_TEXT_2 }),
    block({ type: "text", text: A_TEXT_3 }),
    block({ type: "text", text: A_TEXT_4 }),
    block({ type: "text", text: A_TEXT_5 }),
    block({ type: "quote", text: A_QUOTE.text }),
  ], "A-high"),
  /** Дополнительная проверка (не входит в три обязательных состояния):
   *  фото ещё не выбрано вовсе — в финальном режиме здесь не должно
   *  быть никакой гравюрной заглушки вместо портрета. */
  noPhoto: makeIssue("person-feature-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({ type: "text", text: A_TEXT_SHORT }),
    block({ type: "text", text: A_TEXT_2 }),
  ], "A-no-photo"),
};

// ---- Template B ("Команда") ----

const B_TEXT_1 = "Слаженность подразделения складывается не только в бою. Совместные тренировки, обслуживание техники, помощь товарищам — часть повседневной работы.";
const B_TEXT_2 = "Именно в таких моментах рождается настоящая сила батальона: каждый знает свой участок ответственности и может положиться на соседа по экипажу.";
const B_TEXT_3 = "Ротация задач между сменами позволяет каждому специалисту расширять опыт, не теряя при этом глубокой экспертизы в своём направлении.";
const B_TEXT_4 = "Разбор итогов каждого выхода проходит совместно — это помогает быстро закрывать пробелы в подготовке и делиться удачными решениями со всей ротой.";

// as const → фиксированная по длине tuple, а не string[]: доступ по
// известному индексу (B_ACHIEVEMENTS_SHORT[0]/_LONG[1] ниже) остаётся
// типа string, а не string | undefined (noUncheckedIndexedAccess в
// tsconfig иначе считает индекс обычного массива потенциально пустым).
const B_ACHIEVEMENTS_SHORT = ["Отличные результаты по итогам полевого выхода"] as const;
const B_ACHIEVEMENTS_LONG = [
  "Лучший экипаж по итогам весенних учений",
  "Отмечены за оперативное устранение неисправности в полевых условиях",
  "Рекомендованы к участию в показательных занятиях для новобранцев",
  "Отличные результаты по итогам полевого выхода",
] as const;

export const qaPage4TeamFaces = {
  low: makeIssue("team-faces-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({ type: "photo", src: photoSrc(4), personName: "И. Петров", personRole: "Связист" }),
    block({ type: "text", text: B_TEXT_1 }),
  ], "B-low-1person"),
  normal: makeIssue("team-faces-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({
      type: "photo",
      src: photoSrc(5),
      personName: "Гвардии сержант Дмитрий Николаевич Петров",
      personRole: "Механик-водитель, позывной «Гром»",
    }),
    block({ type: "photo", src: photoSrc(6, "cool"), personName: "А. Сидоров", personRole: "Заряжающий" }),
    block({ type: "text", text: B_TEXT_1 }),
    block({ type: "text", text: B_TEXT_2 }),
    block({ type: "text", text: B_ACHIEVEMENTS_SHORT[0], variant: "achievement" }),
    block({ type: "text", text: B_ACHIEVEMENTS_LONG[1], variant: "achievement" }),
    block({ type: "quote", text: "Танк прощает ошибки только один раз. Поэтому мы работаем чётко, спокойно, слаженно.", author: "Механик-водитель экипажа" }),
  ], "B-normal-2person"),
  high: makeIssue("team-faces-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({
      type: "photo",
      src: photoSrc(7),
      personName: "Гвардии старший сержант Иванов Алексей Сергеевич",
      personRole: "Командир танка, позывной «Сокол»",
    }),
    block({ type: "photo", src: photoSrc(8, "cool"), personName: "Д. Петров", personRole: "Механик-водитель" }),
    block({
      type: "photo",
      src: photoSrc(9),
      personName: "Младший сержант Сидоров Максим Андреевич",
      personRole: "Наводчик-оператор",
    }),
    block({ type: "text", text: B_TEXT_1 }),
    block({ type: "text", text: B_TEXT_2 }),
    block({ type: "text", text: B_TEXT_3 }),
    block({ type: "text", text: B_TEXT_4 }),
    ...B_ACHIEVEMENTS_LONG.map((a) => block({ type: "text", text: a, variant: "achievement" as const })),
    block({ type: "quote", text: "Танк прощает ошибки только один раз. Поэтому мы работаем чётко, спокойно, слаженно.", author: "Механик-водитель экипажа" }),
  ], "B-high-3person"),
  /** Дополнительная проверка: фотографий ещё нет вовсе — ряд портретов
   *  не должен рендериться заглушками. */
  noPhotos: makeIssue("team-faces-v1", [
    block({ type: "heading", level: 1, text: "Лица батальона" }),
    block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
    block({ type: "text", text: B_TEXT_1 }),
    block({ type: "text", text: B_ACHIEVEMENTS_SHORT[0], variant: "achievement" }),
  ], "B-no-photos"),
};
