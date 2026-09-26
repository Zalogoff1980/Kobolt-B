import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { groupPageBlocks } from "@/lib/content/pageBlocks";

function firstOfType<T extends ContentBlock["type"]>(
  blocks: ContentBlock[],
  type: T
): Extract<ContentBlock, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as any;
}

type GridEntry = {
  pageNumber: number;
  title?: string;
  subtitle?: string;
  thumbnailSrc?: string;
};

function buildEntries(issue: Issue): GridEntry[] {
  return Object.entries(issue.pages)
    .filter(([num]) => num !== "1")
    .map(([num, page]) => {
      const { title, subtitle } = groupPageBlocks(page.content.blocks);
      const photo = firstOfType(page.content.blocks, "photo");
      return {
        pageNumber: Number(num),
        title: title?.text,
        subtitle: subtitle?.text,
        thumbnailSrc: photo?.src,
      };
    });
}

/**
 * Раскладка "В номере" для cover-v2 (макет ТЗ шага 9): раздельно —
 * компактный текстовый список слева (номер + заголовок + подзаголовок
 * + "Стр. X", без миниатюры) и отдельная сетка карточек с фото справа
 * (2 колонки — по количеству реально существующих внутренних страниц,
 * ничего не выдумываем, если страниц меньше 4, сетка просто короче).
 * Те же данные, что и у ContentsBlock (страница cover-v1) — другая
 * раскладка одних и тех же Issue.pages, Content Zones не участвуют.
 */
export function ContentsGrid({ issue }: { issue: Issue }) {
  const entries = buildEntries(issue);
  // Нечётное число реально существующих материалов (обычно 3, т.к. в
  // выпуске страницы 2-4) не должно оставлять пустую ячейку 2×2 сетки
  // (найдено QA) — последняя карточка в этом случае растягивается на
  // всю ширину сетки, а не "зависает" рядом с пустым местом.
  const isLastOdd = (i: number) => i === entries.length - 1 && entries.length % 2 === 1;

  return (
    // Без h-full: у cover-v2 теперь под этим блоком идёт ещё и
    // NewsBlock (см. CoverV2.tsx) — если ContentsGrid растягивался бы
    // на всю оставшуюся высоту сам по себе, месту для новостей ниже
    // просто неоткуда было бы взяться. Без h-full сетка занимает
    // столько высоты, сколько требует её реальное содержимое (grid и
    // так выравнивает обе колонки по высоте между собой).
    <div className="grid grid-cols-[42mm_1fr] gap-[6mm]">
      <div>
        <h3 className="font-display text-[15px] font-bold uppercase leading-none tracking-wide text-olive">
          В номере:
        </h3>
        <ul className="mt-[4mm] space-y-[4.5mm]">
          {entries.map((entry) => (
            <li key={entry.pageNumber} className="flex items-start gap-[2.5mm]">
              <span className="font-display text-[22px] font-bold leading-[0.85] text-accent">
                {String(entry.pageNumber).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                {entry.title ? (
                  <p className="font-display text-[9.5px] font-bold uppercase leading-tight text-ink">
                    {entry.title}
                  </p>
                ) : (
                  <p className="font-body text-[8px] italic text-olive-dim">
                    Материал ещё не добавлен
                  </p>
                )}
                {entry.subtitle && (
                  <p className="mt-[0.5mm] font-body text-[7.5px] leading-tight text-olive-dim">
                    {entry.subtitle}
                  </p>
                )}
                <p className="mt-[0.5mm] font-display text-[7px] font-bold uppercase text-accent">
                  Стр. {entry.pageNumber}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 content-center gap-[4mm]">
        {entries.map((entry, i) => (
          <div key={entry.pageNumber} className={isLastOdd(i) ? "col-span-2" : ""}>
            <div className="h-[28mm] overflow-hidden bg-olive/10">
              {entry.thumbnailSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.thumbnailSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mt-[2mm] flex items-baseline justify-between gap-[2mm]">
              <p className="font-display text-[9.5px] font-bold uppercase leading-tight text-ink">
                {entry.title ?? "Материал ещё не добавлен"}
              </p>
              <span className="flex-shrink-0 font-display text-[7px] font-bold uppercase text-accent">
                Стр. {entry.pageNumber}
              </span>
            </div>
            {entry.subtitle && (
              <p className="mt-[0.5mm] font-body text-[7.5px] leading-snug text-olive-dim">
                {entry.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
