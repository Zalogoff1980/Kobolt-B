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
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const photo = photos[0];
  const hasBodyText = Boolean(lead) || paragraphs.length > 0;

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      {/* Заголовок теперь ВНУТРИ строки с фото (не отдельным полноширинным
          блоком над ней), чтобы верх заголовка и верх фото совпадали
          вровень — так же, как на утверждённом макете обложки, где
          hero-заголовок и фото стоят в одной строке (QA: "заголовок
          начинается хрен пойми как относительно верхнего края
          изображения... как в утверждённом макете, так и на всех
          остальных"). showIcon отключена — гравюрная иконка рассчитана
          на полноширинный заголовок, в узкой колонке она тесна.
          Без своего mt- сверху: отступ от шапки уже даёт InnerPageShell. */}
      <div className="grid grid-cols-[1fr_76mm] items-start gap-[6mm]">
        <div className="space-y-[3mm]">
          <ArticleTitle title={title?.text} subtitle={subtitle?.text} showIcon={false} />
          {/* Основной текст/лид — типографически крупнее и жирнее
              обычных абзацев, отдельное семантическое поле, а не
              "первый абзац по счёту" (найденная проблема иерархии).
              Отступ от заголовка — тот же space-y-[3mm], что и между
              остальными элементами колонки. */}
          {lead && (
            <p data-zone="lead" className="font-body text-[19px] font-bold leading-[1.6] text-ink">
              {lead.text}
            </p>
          )}
          {paragraphs.map((p) => (
            <p key={p.id} data-zone="paragraph" className="font-body text-[16px] leading-[1.6] text-ink/90">
              {p.text}
            </p>
          ))}
          {quotes.length > 0 && !hasBodyText && (
            <div className="space-y-[3mm]">
              {quotes.map((q) => (
                <PullQuote key={q.id} text={q.text} author={q.author} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div data-zone="photo" className="relative h-[150mm] overflow-hidden bg-olive/10">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.src} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <EngravingTank className="h-[45%] w-[80%] text-olive/30" />
              </div>
            )}
            {photo?.caption && (
              <div data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[3mm] py-[2mm]">
                <p className="font-body text-[11px] italic text-paper/90">{photo.caption}</p>
              </div>
            )}
          </div>

          {/* Текстовый блок под фото (QA, скриншот: "в таком лэйауте
              неуместное пустое место" — фото фиксированной высоты
              150мм, а строка грида растягивается по более высокой
              текстовой колонке слева, из-за чего под фото справа
              оставалось пустое поле до конца страницы). Цитата теперь
              размещается прямо здесь, а не отдельным полноширинным
              блоком под всей раскладкой — так место под фото занято
              содержанием, а не пустотой. Если цитаты нет, колонка
              просто заканчивается на фото — ничего не выдумываем. */}
          {quotes.length > 0 && hasBodyText && (
            <div className="mt-[4mm] space-y-[3mm]">
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
