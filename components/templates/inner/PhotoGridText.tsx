import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";

/** Число колонок сетки фото и их высота зависят от количества
 *  снимков — это и делает шаблон "адаптивным", а не фиксированной
 *  раскладкой под конкретное число фото.
 *
 *  Для 4+ фото высота дополнительно уменьшается по числу строк, а не
 *  остаётся фиксированной: 5 фото в 2 колонки дают 3 строки, и при
 *  неизменных 58мм на строку сетка вместе с текстом ниже перестаёт
 *  помещаться на A4 (обнаружено QA-тестом "большой объём" — сетка
 *  сама по себе выходила за пределы страницы примерно на 12мм).
 *  GRID_MAX_HEIGHT_MM — бюджет высоты, внутри которого сетка обязана
 *  остаться независимо от того, сколько строк фото потребуется. */
const GRID_GAP_MM = 3;
const GRID_MAX_HEIGHT_MM = 130;

function gridLayout(count: number): { cols: number; heightMm: number } {
  if (count <= 1) return { cols: 1, heightMm: 95 };
  if (count === 2) return { cols: 2, heightMm: 72 };
  if (count === 3) return { cols: 3, heightMm: 58 };
  const cols = 2;
  const rows = Math.ceil(count / cols);
  const heightMm = Math.floor((GRID_MAX_HEIGHT_MM - (rows - 1) * GRID_GAP_MM) / rows);
  return { cols, heightMm };
}

/**
 * Template B страницы "История" — "несколько фотографий + текст"
 * (ТЗ шаг 3). Фотогалерея сверху (её раскладка считается от числа
 * снимков), текст статьи — ниже, в две колонки для более "новостного"
 * ритма, отличного от Template A.
 */
export function PhotoGridText({ issue, pageNumber }: { issue: Issue; pageNumber: 2 }) {
  const { title, subtitle, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const quote = quotes[0];
  const { cols, heightMm } = gridLayout(photos.length);

  return (
    <InnerPageShell pageNumber={pageNumber} issueNumber={issue.number} issueDate={issue.date}>
      <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

      <div className="mt-[5mm]">
        {photos.length > 0 ? (
          <div
            className="grid gap-[3mm]"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {photos.map((p) => (
              <figure
                key={p.id}
                className="relative overflow-hidden bg-olive/10"
                style={{ height: `${heightMm}mm` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                {p.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]">
                    <span className="font-body text-[6.5px] italic text-paper/90">{p.caption}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="flex h-[70mm] items-center justify-center bg-olive/10">
            <EngravingTank className="h-[50%] w-[60%] text-olive/30" />
          </div>
        )}

        {paragraphs.length > 0 && (
          <div
            className={`mt-[5mm] gap-[6mm] text-[8.5px] leading-relaxed text-ink/90 ${
              paragraphs.length > 1 ? "columns-2 [column-fill:balance]" : ""
            }`}
            style={paragraphs.length === 1 ? { maxWidth: "110mm" } : undefined}
          >
            {paragraphs.map((p) => (
              <p key={p.id} className="mb-[3mm] break-inside-avoid font-body">
                {p.text}
              </p>
            ))}
          </div>
        )}

        {quote && (
          <div className="mt-[4mm] max-w-[110mm]">
            <PullQuote text={quote.text} author={quote.author} />
          </div>
        )}
      </div>
    </InnerPageShell>
  );
}
