import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { PageFrame } from "@/components/canvas/PageFrame";
import { EngravingTank } from "@/components/decorative/EngravingTank";
import { Masthead } from "./Masthead";
import { EditorialRule } from "@/components/shared/EditorialRule";
import { HeroMedia } from "./HeroMedia";
import { ContentsBlock, ContentsEntry } from "./ContentsBlock";
import { NewsBlock } from "./NewsBlock";

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
  // Сколько угодно цитат (QA: "дать возможность добавлять такой блок
  // сколько нужно" — раньше читалась только первая, firstOfType).
  const heroQuotes = coverBlocks.filter(
    (b): b is Extract<ContentBlock, { type: "quote" }> => b.type === "quote"
  );
  // Обложка не использует H1 (он зарезервирован под заголовок статьи
  // внутренних страниц) — здесь level 2 это главный hero-заголовок,
  // level 3 — подзаголовок под ним (поля редактора, шаг 7).
  const heroHeading = coverBlocks.find((b) => b.type === "heading" && b.level === 2) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  const heroSubtitle = coverBlocks.find((b) => b.type === "heading" && b.level === 3) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  // Текстовый блок hero-колонки (тот же источник данных, что и у
  // cover-v2) — раньше не передавался сюда вовсе, из-за чего при
  // переключении шаблона страницы 1 с cover-v2 на cover-v1 введённый
  // оператором текст визуально "исчезал", хотя данные не терялись
  // (баг найден QA: "переключил макет... текстовый блок исчез").
  const { paragraphs } = groupPageBlocks(coverBlocks);

  const contentsEntries: ContentsEntry[] = Object.entries(issue.pages)
    .filter(([num]) => num !== "1")
    .map(([num, page]) => {
      const heading = firstOfType(page.content.blocks, "heading");
      const photo = firstOfType(page.content.blocks, "photo");
      // Превью-текст под заголовком (QA: "выводить первые три-четыре
      // строчки текста") — лид статьи, если он есть, иначе первый
      // обычный абзац; строки уже режутся визуально через line-clamp
      // в ContentsBlock, а не здесь.
      const { lead, paragraphs } = groupPageBlocks(page.content.blocks);
      return {
        pageNumber: Number(num),
        title: heading?.text,
        thumbnailSrc: photo?.src,
        previewText: lead?.text ?? paragraphs[0]?.text,
      };
    });

  return (
    <PageFrame backgroundEngravingId={issue.pages[1].backgroundEngravingId}>
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
            paragraphs={paragraphs}
            quotes={heroQuotes.map((q) => ({ id: q.id, text: q.text, author: q.author }))}
          />
        </div>

        <EditorialRule className="mt-[4mm]" />

        {/* "В номере" | "Новости" — та же пропорция колонок, что и в
            hero-строке выше (фото flex-[2.1] + текст flex-1 из HeroMedia),
            так что список превью выравнивается по правому краю ровно
            под фото, а новости идут дальше под текстовой колонкой (QA:
            "выровнять их по правому краю верхней картинки... справа, в
            освободившемся месте, вставить блок с новостями"). */}
        <div className="mt-[4mm] flex flex-1 gap-[3mm]">
          <div className="flex-[2.1]">
            <ContentsBlock entries={contentsEntries} />
          </div>
          <div className="flex-1">
            <NewsBlock rawText={issue.coverNews} />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
