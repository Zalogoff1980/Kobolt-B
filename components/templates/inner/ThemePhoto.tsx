import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";

/**
 * Страница 3 ("тематический материал"), Template A — "большое фото +
 * текст" (ТЗ шаг 4). Композиция сознательно отличается от Template A
 * страницы 2: там фото стоит узкой высокой колонкой рядом с текстом
 * на всю высоту страницы; здесь — один широкий кадр-баннер над
 * текстом, а сам текст идёт двумя колонками под ним. Общий язык
 * (шрифты, поля, шапка, PullQuote, гравюра-заглушка) не меняется.
 */
export function ThemePhoto({ issue, pageNumber }: { issue: Issue; pageNumber: 3 }) {
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const photo = photos[0];
  const quote = quotes[0];

  return (
    <InnerPageShell pageNumber={pageNumber} issueNumber={issue.number} issueDate={issue.date}>
      <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

      <div data-zone="photo" className="relative mt-[5mm] h-[105mm] overflow-hidden bg-olive/10">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EngravingTank className="h-[45%] w-[70%] text-olive/30" />
          </div>
        )}
        {photo?.caption && (
          <div data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[3mm] py-[2mm]">
            <p className="font-body text-[7px] italic text-paper/90">{photo.caption}</p>
          </div>
        )}
      </div>

      {/* Основной текст/лид — отдельное семантическое поле, крупнее и
          жирнее тела статьи, полной шириной над многоколоночным телом. */}
      {lead && (
        <p data-zone="lead" className="mt-[5mm] max-w-[130mm] font-body text-[9.5px] font-bold leading-relaxed text-ink">
          {lead.text}
        </p>
      )}

      {paragraphs.length > 0 && (
        <div
          className={`mt-[5mm] gap-[6mm] text-[8.5px] leading-relaxed text-ink/90 ${
            paragraphs.length > 1 ? "columns-2 [column-fill:balance]" : ""
          }`}
          style={paragraphs.length === 1 ? { maxWidth: "120mm" } : undefined}
        >
          {paragraphs.map((p) => (
            <p key={p.id} data-zone="paragraph" className="mb-[3mm] break-inside-avoid font-body">
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
    </InnerPageShell>
  );
}
