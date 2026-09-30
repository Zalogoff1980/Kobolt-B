import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";
import { EditorialRule } from "@/components/shared/EditorialRule";

const RAIL_MAX_HEIGHT_MM = 180;
const RAIL_GAP_MM = 3;

/** Высота каждого кадра в вертикальной "плёнке" зависит от того,
 *  сколько их — 1, 2 или 3 (шаблон рассчитан именно на этот диапазон) —
 *  в рамках общего бюджета высоты, а не тянется на всю страницу
 *  независимо от количества. */
function railPhotoHeight(count: number): number {
  const n = Math.max(1, count);
  return Math.floor((RAIL_MAX_HEIGHT_MM - (n - 1) * RAIL_GAP_MM) / n);
}

/**
 * Страница 3, Template B — "текст + 2–3 фото + открытка" (ТЗ шаг 4).
 * Композиция отличается и от Template A этой же страницы (баннер
 * сверху), и от Template B страницы 2 (сетка фото сверху, текст
 * снизу): здесь текст — основная widescreen-колонка слева, фото идут
 * узкой вертикальной "плёнкой"-рубрикой справа, максимум три кадра.
 * Отдельно, под дивайдером — четвёртое фото, "открытка" на всю ширину
 * страницы без обрезания (QA: "в шаблоне не надо предусматривать
 * четыре вертикальных фото. Надо предусмотреть три вертикальных фото
 * и отдельный блок... открытка... Мы туда будем вставлять открытку").
 */
export function ThemeTextPhotos({ issue, pageNumber }: { issue: Issue; pageNumber: 3 }) {
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const railPhotos = photos.slice(0, 3);
  const photoHeight = railPhotoHeight(railPhotos.length);
  // 4-е фото — отдельная открытка на всю ширину под дивайдером (QA:
  // "после дивайдера нужно будет вставлять фото на всю ширину
  // страницы, без обрезания, т.к. это будет готовая открытка") —
  // отдельный, чётко именованный слот, а не часть рельсы (которая
  // жёстко ограничена тремя кадрами).
  const postcardPhoto = photos[3];

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      <div className="flex h-full flex-col">
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
            <p data-zone="lead" className="font-body text-[19px] font-bold leading-[1.6] text-ink">
              {lead.text}
            </p>
          )}
          {paragraphs.map((p) => (
            <p key={p.id} data-zone="paragraph" className="font-body text-[16px] leading-[1.3] text-ink/90">
              {p.text}
            </p>
          ))}
          {quotes.length > 0 && (
            <div className="space-y-[3mm]">
              {quotes.map((q) => (
                <PullQuote key={q.id} text={q.text} author={q.author} />
              ))}
            </div>
          )}
        </div>

        <div data-zone="photo" className="space-y-[3mm]">
          {railPhotos.length > 0 ? (
            railPhotos.map((p) => (
              <figure key={p.id} className="relative overflow-hidden bg-olive/10" style={{ height: `${photoHeight}mm` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                {p.caption && (
                  <figcaption data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]">
                    <span className="font-body text-[11px] italic text-paper/90">{p.caption}</span>
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

        {postcardPhoto && (
          <>
            {/* Дивайдер после нижнего фото рельсы — те же отступы, что
                уже применяются к дивайдерам на внутренней странице
                (InnerPageShell: variant="double", mt-[4mm]). */}
            <EditorialRule variant="double" className="mt-[4mm]" />

            {/* Открытка на всю ширину страницы, БЕЗ обрезания (QA: "без
                обрезания, т.к. это будет готовая открытка") — в отличие
                от остальных фото в этом шаблоне (и во всём приложении),
                здесь намеренно НЕТ фиксированной высоты и object-cover:
                контейнер просто следует естественным пропорциям
                картинки на всю ширину колонки. */}
            <div data-zone="photo" className="mt-[4mm]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={postcardPhoto.src} alt={postcardPhoto.caption ?? ""} className="block w-full h-auto" />
              {postcardPhoto.caption && (
                <p data-zone="caption" className="mt-[1.5mm] font-body text-[11px] italic text-ink/70">
                  {postcardPhoto.caption}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </InnerPageShell>
  );
}
