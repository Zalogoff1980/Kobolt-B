import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";

const RAIL_MAX_HEIGHT_MM = 180;
const RAIL_GAP_MM = 3;

/** Высота каждого кадра в вертикальной "плёнке" зависит от того,
 *  сколько их — 1, 2 или 3 (ТЗ шаг 4 ограничивает шаблон именно этим
 *  диапазоном) — в рамках общего бюджета высоты, а не тянется на всю
 *  страницу независимо от количества. */
function railPhotoHeight(count: number): number {
  const n = Math.max(1, count);
  return Math.floor((RAIL_MAX_HEIGHT_MM - (n - 1) * RAIL_GAP_MM) / n);
}

/**
 * Страница 3, Template B — "текст + 2–3 фотографии" (ТЗ шаг 4).
 * Композиция отличается и от Template A этой же страницы (баннер
 * сверху), и от Template B страницы 2 (сетка фото сверху, текст
 * снизу): здесь текст — основная widescreen-колонка слева, фото идут
 * узкой вертикальной "плёнкой"-рубрикой справа, максимум три кадра.
 */
export function ThemeTextPhotos({ issue, pageNumber }: { issue: Issue; pageNumber: 3 }) {
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const railPhotos = photos.slice(0, 3);
  const quote = quotes[0];
  const photoHeight = railPhotoHeight(railPhotos.length);

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      {/* Заголовок теперь внутри строки с фото, не отдельным блоком
          над ней — верх заголовка и верх фото-плёнки совпадают вровень,
          как на утверждённом макете обложки (QA: "как в утверждённом
          макете, так и на всех остальных"). Без своего mt- сверху:
          отступ от шапки уже даёт InnerPageShell. */}
      <div className="grid grid-cols-[1fr_58mm] items-start gap-[6mm]">
        <div className="space-y-[3mm]">
          <ArticleTitle title={title?.text} subtitle={subtitle?.text} showIcon={false} />
          {/* Основной текст/лид — отдельное семантическое поле,
              крупнее и жирнее обычных абзацев. */}
          {lead && (
            <p data-zone="lead" className="font-body text-[9.5px] font-bold leading-[1.6] text-ink">
              {lead.text}
            </p>
          )}
          {paragraphs.map((p) => (
            <p key={p.id} data-zone="paragraph" className="font-body text-[8.5px] leading-[1.6] text-ink/90">
              {p.text}
            </p>
          ))}
          {quote && <PullQuote text={quote.text} author={quote.author} />}
        </div>

        <div data-zone="photo" className="space-y-[3mm]">
          {railPhotos.length > 0 ? (
            railPhotos.map((p) => (
              <figure key={p.id} className="relative overflow-hidden bg-olive/10" style={{ height: `${photoHeight}mm` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                {p.caption && (
                  <figcaption data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]">
                    <span className="font-body text-[6.5px] italic text-paper/90">{p.caption}</span>
                  </figcaption>
                )}
              </figure>
            ))
          ) : (
            <div
              className="flex items-center justify-center bg-olive/10"
              style={{ height: `${railPhotoHeight(1)}mm` }}
            >
              <EngravingTank className="h-[40%] w-[75%] text-olive/30" />
            </div>
          )}
        </div>
      </div>
    </InnerPageShell>
  );
}
