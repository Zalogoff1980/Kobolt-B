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
 * текстом, а сам текст идёт одной колонкой под ним. Общий язык
 * (шрифты, поля, шапка, PullQuote, гравюра-заглушка) не меняется.
 *
 * Текст раньше шёл через CSS columns-2 с авто-балансом браузера —
 * недетерминированный перенос абзацев между "колонками" (тот же
 * баг, что и в PhotoGridText, QA: "непонятно, к какой фотке
 * относить текст"). Теперь одна колонка; если текста мало, блок
 * лид+абзацы+цитата центрируется в оставшемся под фото пространстве.
 */
export function ThemePhoto({ issue, pageNumber }: { issue: Issue; pageNumber: number }) {
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber]!.content.blocks
  );
  const photo = photos[0];

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber]!.backgroundEngravingId}
    >
      <div className="flex h-full flex-col">
        <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

        {/* Заголовок → фото уплотнён (единая "плотность как на обложке"
            для всех внутренних шаблонов) — было 5мм. */}
        <div data-zone="photo" className="relative mt-[4mm] h-[105mm] flex-shrink-0 overflow-hidden bg-olive/10">
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
              <p className="font-body text-[11px] italic text-paper/90">{photo.caption}</p>
            </div>
          )}
        </div>

        <div className="mt-[4mm] flex flex-1 flex-col justify-center">
          {lead && (
            // Ширина текста — во всю ширину фото выше (QA, шаблон
            // "Большое фото и текст": "текст выполнить на всю ширину
            // фото"), а не ограничена узкой колонкой 130мм.
            <p data-zone="lead" className="font-body text-[19px] font-bold leading-[1.6] text-ink">
              {lead.text}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className={`space-y-[3mm] text-[16px] leading-[1.3] text-ink/90 ${lead ? "mt-[3mm]" : ""}`}>
              {paragraphs.map((p) => (
                <p key={p.id} data-zone="paragraph" className="font-body">
                  {p.text}
                </p>
              ))}
            </div>
          )}

          {quotes.length > 0 && (
            <div className={`max-w-[110mm] space-y-[3mm] ${lead || paragraphs.length > 0 ? "mt-[4mm]" : ""}`}>
              {quotes.map((q) => (
                <PullQuote key={q.id} text={q.text} author={q.author} />
              ))}
            </div>
          )}
        </div>
      </div>
    </InnerPageShell>
  );
}
