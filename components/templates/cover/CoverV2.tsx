import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { PageFrame } from "@/components/canvas/PageFrame";
import { Emblem } from "./Emblem";
import { IssueMeta } from "./IssueMeta";
import { EditorialRule } from "@/components/shared/EditorialRule";
import { HeroMedia } from "./HeroMedia";
import { ContentsGrid } from "./ContentsGrid";

const TAGLINE = ["СИЛА", "В ДВИЖЕНИИ", "ЧЕСТЬ", "БРАТСТВО", "ПОБЕДА"];
const CLOSING_LINE = "Там, где другие останавливаются, танкисты идут вперёд.";

function firstOfType<T extends ContentBlock["type"]>(
  blocks: ContentBlock[],
  type: T
): Extract<ContentBlock, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as any;
}

/**
 * Шаблон обложки "cover-v2" — второй вариант оформления страницы 1
 * (второй пункт TEMPLATE_OPTIONS[1]), собранный по сетке, снятой с
 * присланного пользователем макета (шаг: "Разбери макет на сетку").
 * Использует ТУ ЖЕ модель контента страницы 1, что и cover-v1 (hero
 * heading level 2 / subtitle level 3 / photo / quote) — смена варианта
 * обложки через TemplatePicker не требует переввода контента, ровно
 * как и смена шаблона на страницах 2–4.
 *
 * Разметка страницы (мм, от верхнего края A4, поля 12mm — см. таблицу
 * сетки в переписке): тег-лайн ~7мм → шапка (эмблемы + крупный
 * заголовок + красная лента + подзаголовок + номер/дата) ~80мм →
 * двойная линейка → hero-блок (фото + заголовок/цитата) ~91мм →
 * линейка → блок "В номере" (список + сетка миниатюр 2×2) ~85мм →
 * закрывающая строка-девиз.
 */
export function CoverV2({ issue }: { issue: Issue }) {
  const coverBlocks = issue.pages[1].content.blocks;
  const heroPhoto = firstOfType(coverBlocks, "photo");
  const heroQuote = firstOfType(coverBlocks, "quote");
  const heroHeading = coverBlocks.find((b) => b.type === "heading" && b.level === 2) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  const heroSubtitle = coverBlocks.find((b) => b.type === "heading" && b.level === 3) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  // Текстовый блок hero-колонки (QA-находка: пусто, если материала
  // мало и нет цитаты) — groupPageBlocks достаточно и здесь: title/
  // subtitle из него не используются (обложка их читает сама выше по
  // своим level 2/3, а не по level 1/level!=1 — см. groupPageBlocks),
  // но группировка paragraphs одинакова для всех страниц.
  const { paragraphs } = groupPageBlocks(coverBlocks);

  return (
    <PageFrame backgroundEngravingId={issue.pages[1].backgroundEngravingId}>
      <div className="relative flex h-full flex-col px-[var(--page-margin)] py-[8mm]">
        {/* Тег-лайн */}
        <div className="flex items-center justify-center gap-[2mm] font-display text-[7px] font-bold uppercase tracking-[0.2em] text-olive-dim">
          {TAGLINE.map((word, i) => (
            <span key={word} className="flex items-center gap-[2mm]">
              {i > 0 && <span className="text-accent">•</span>}
              {word}
            </span>
          ))}
        </div>

        {/* Шапка — крупнее, чем у cover-v1: заголовок издания несёт
            основной визуальный вес страницы (по макету). Заголовок
            почти во всю ширину центральной колонки (QA: "таких же
            размеров хотелось бы добиться"), №/дата — на одной строке
            с подзаголовком, справа (QA: "нравится расположение и
            размер номер и дата выпуска" в референсе). */}
        <div className="mt-[5mm] grid grid-cols-[28mm_1fr_28mm] items-start gap-[4mm]">
          <Emblem
            imageSrc="/emblems/emblem-tank-corps.jpg"
            label="Танковые войска"
            sublabel="Броня соединяет людей"
            shape="circle"
          />

          <div className="text-center">
            <h1 className="font-display text-[90px] font-bold uppercase leading-[0.8] tracking-tight">
              <span className="block text-ink">Танковый</span>
              <span className="block text-olive">Батальон</span>
            </h1>

            <div className="mx-auto mt-[2.5mm] inline-block -rotate-1 bg-accent px-[5mm] py-[1.5mm]">
              <span className="font-display text-[17px] font-bold uppercase tracking-wide text-paper">
                Боевой листок
              </span>
            </div>

            <div className="mt-[2.5mm] flex items-baseline justify-between gap-[4mm]">
              <p className="font-body text-[7.5px] uppercase tracking-wide text-olive-dim">
                Внутреннее издание танкового батальона
              </p>
              <IssueMeta number={issue.number} date={issue.date} />
            </div>
          </div>

          <Emblem
            imageSrc="/emblems/emblem-shavlinsky.jpg"
            label="Шавлинский полк"
            sublabel="Вместе к новым победам"
            shape="shield"
          />
        </div>

        <EditorialRule variant="double" className="mt-[4mm]" />

        <div className="mt-[5mm]">
          <HeroMedia
            photo={heroPhoto ? { src: heroPhoto.src, caption: heroPhoto.caption } : undefined}
            headline={
              heroHeading
                ? { lines: [{ text: heroHeading.text, accent: true }] }
                : undefined
            }
            subtitle={heroSubtitle?.text}
            paragraphs={paragraphs}
            quote={heroQuote ? { text: heroQuote.text, author: heroQuote.author } : undefined}
          />
        </div>

        <EditorialRule className="mt-[5mm]" />

        <div className="mt-[5mm] flex-1">
          <ContentsGrid issue={issue} />
        </div>

        <p className="mt-[3mm] text-right font-body text-[7.5px] italic leading-snug text-olive-dim">
          {CLOSING_LINE}
        </p>
      </div>
    </PageFrame>
  );
}
