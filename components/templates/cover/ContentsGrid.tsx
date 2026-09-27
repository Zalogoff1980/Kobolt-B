import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { splitLines } from "@/lib/content/textLines";

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
 * Раскладка для cover-v2 (макет ТЗ шага 9): слева — блок "День в
 * истории", справа — сетка карточек с фото и подписями-заголовками
 * (2 колонки — по количеству реально существующих внутренних страниц,
 * ничего не выдумываем, если страниц меньше 4, сетка просто короче).
 *
 * Раньше слева был текстовый список "В номере" (номер + заголовок +
 * подзаголовок + "Стр. X", без миниатюры) — QA заметил, что он
 * дублирует подписи под миниатюрами справа ("в номере написано
 * текстом, а превьюшки с картинками... два одинаковых блока в разной
 * степени содержания"). Заменили на исторические факты дня выпуска
 * (issue.dayInHistory, тот же формат "текст с переносами", что и у
 * coverNews — см. splitLines) — подписи под миниатюрами справа при
 * этом остаются единственным местом, где показывается заголовок
 * страницы, повтора больше нет.
 */
export function ContentsGrid({ issue }: { issue: Issue }) {
  const entries = buildEntries(issue);
  const historyItems = splitLines(issue.dayInHistory ?? "");
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
      <div data-zone="dayInHistory">
        <h3 className="font-display text-[15px] font-bold uppercase leading-none tracking-wide text-olive">
          День в истории:
        </h3>
        {historyItems.length > 0 ? (
          <ul className="mt-[4mm] space-y-[3.5mm]">
            {historyItems.map((text, i) => (
              <li
                key={i}
                className={i > 0 ? "border-t border-ink/15 pt-[3.5mm]" : ""}
              >
                <div className="flex items-start gap-[2.5mm]">
                  <span className="flex-shrink-0 font-display text-[18px] font-bold leading-none text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-body text-[8px] leading-snug text-ink/90">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-[4mm] font-body text-[8px] italic text-olive-dim">
            Материал ещё не добавлен
          </p>
        )}
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
              <span className="flex-shrink-0 font-display text-[13px] font-bold uppercase text-accent">
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
