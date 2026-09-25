import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";

/**
 * Template A страницы "История" — "статья + большое фото" (ТЗ шаг 3).
 * Один крупный кадр справа, текст статьи слева. Если фото ещё нет —
 * место занимает та же гравюрная заглушка, что и в HeroMedia обложки
 * (единый язык "материал ещё не выбран" по всему изданию). Если текста
 * нет — колонка остаётся пустой, ничего не подставляем.
 */
export function ArticlePhoto({ issue, pageNumber }: { issue: Issue; pageNumber: 2 }) {
  const { title, subtitle, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const photo = photos[0];
  const quote = quotes[0];

  return (
    <InnerPageShell pageNumber={pageNumber} issueNumber={issue.number} issueDate={issue.date}>
      <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

      <div className="mt-[5mm] grid grid-cols-[1fr_76mm] items-start gap-[6mm]">
        <div className="space-y-[3mm]">
          {paragraphs.map((p) => (
            <p key={p.id} className="font-body text-[8.5px] leading-relaxed text-ink/90">
              {p.text}
            </p>
          ))}
          {quote && paragraphs.length === 0 && <PullQuote text={quote.text} author={quote.author} />}
        </div>

        <div>
          <div className="relative h-[150mm] overflow-hidden bg-olive/10">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.src} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <EngravingTank className="h-[45%] w-[80%] text-olive/30" />
              </div>
            )}
            {photo?.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[3mm] py-[2mm]">
                <p className="font-body text-[7px] italic text-paper/90">{photo.caption}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {quote && paragraphs.length > 0 && (
        <div className="mt-[4mm] max-w-[100mm]">
          <PullQuote text={quote.text} author={quote.author} />
        </div>
      )}
    </InnerPageShell>
  );
}
