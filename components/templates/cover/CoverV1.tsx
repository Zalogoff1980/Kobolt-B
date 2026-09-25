import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { PageFrame } from "@/components/canvas/PageFrame";
import { EngravingTank } from "@/components/decorative/EngravingTank";
import { Masthead } from "./Masthead";
import { EditorialRule } from "@/components/shared/EditorialRule";
import { HeroMedia } from "./HeroMedia";
import { ContentsBlock, ContentsEntry } from "./ContentsBlock";

function firstOfType<T extends ContentBlock["type"]>(
  blocks: ContentBlock[],
  type: T
): Extract<ContentBlock, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as any;
}

/**
 * Шаблон обложки "cover-v1" — единственный шаблон страницы 1 (ТЗ п.5:
 * "1 основной шаблон обложки"). Собран из отдельных компонентов, сам
 * не содержит вёрстки — только раскладку блоков и вывод данных Issue.
 */
export function CoverV1({ issue }: { issue: Issue }) {
  const coverBlocks = issue.pages[1].content.blocks;
  const heroPhoto = firstOfType(coverBlocks, "photo");
  const heroQuote = firstOfType(coverBlocks, "quote");
  // Обложка не использует H1 (он зарезервирован под заголовок статьи
  // внутренних страниц) — здесь level 2 это главный hero-заголовок,
  // level 3 — подзаголовок под ним (поля редактора, шаг 7).
  const heroHeading = coverBlocks.find((b) => b.type === "heading" && b.level === 2) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  const heroSubtitle = coverBlocks.find((b) => b.type === "heading" && b.level === 3) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;

  const contentsEntries: ContentsEntry[] = Object.entries(issue.pages)
    .filter(([num]) => num !== "1")
    .map(([num, page]) => {
      const heading = firstOfType(page.content.blocks, "heading");
      const photo = firstOfType(page.content.blocks, "photo");
      return {
        pageNumber: Number(num),
        title: heading?.text,
        thumbnailSrc: photo?.src,
      };
    });

  return (
    <PageFrame>
      {/* Фоновая гравюрная иллюстрация (ТЗ п.11) — композиционный якорь
          нижней части страницы, когда материала мало (ТЗ п.4). Показываем
          её, только если фото уже занимает hero-блок: если фото ещё нет,
          тот же мотив уже нарисован как заглушка в HeroMedia — второй
          гравюры на странице одновременно быть не должно. */}
      {heroPhoto && (
        <EngravingTank
          className="pointer-events-none absolute bottom-0 right-[-10mm] w-[140mm] text-olive opacity-5"
        />
      )}

      <div className="relative flex h-full flex-col px-[var(--page-margin)] py-[10mm]">
        <Masthead issueNumber={issue.number} issueDate={issue.date} />

        <EditorialRule variant="double" className="mt-[4mm]" />

        <div className="mt-[4mm]">
          <HeroMedia
            photo={heroPhoto ? { src: heroPhoto.src, caption: heroPhoto.caption } : undefined}
            headline={
              heroHeading
                ? { lines: [{ text: heroHeading.text, accent: true }] }
                : undefined
            }
            subtitle={heroSubtitle?.text}
            quote={heroQuote ? { text: heroQuote.text, author: heroQuote.author } : undefined}
          />
        </div>

        <EditorialRule className="mt-[4mm]" />

        <div className="mt-[4mm] flex-1">
          <ContentsBlock entries={contentsEntries} />
        </div>
      </div>
    </PageFrame>
  );
}
