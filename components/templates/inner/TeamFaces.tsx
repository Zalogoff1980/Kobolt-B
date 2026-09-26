import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";

/** Высота портретов зависит от их числа (1–3, как задано ТЗ шага 5) —
 *  но, в отличие от пейзажных фото других страниц, кадр держится
 *  крупным при любом количестве: люди — главный визуальный элемент
 *  страницы, а не иллюстрация к тексту. */
function photoHeightMm(count: number): number {
  if (count <= 1) return 140;
  if (count === 2) return 115;
  return 95;
}

/**
 * Страница 4, Template B — "Команда" (ТЗ шаг 5): 2–3 портрета с
 * подписью-именем под каждым, общий текст, список достижений/наград
 * (если есть), при необходимости цитата. Как и в Template A — если
 * фото нет вовсе, ряд портретов просто не рендерится: гравюрная
 * заглушка здесь неуместна (это страница о конкретных людях).
 *
 * Текст раньше шёл через CSS columns-2 с авто-балансом браузера — тот
 * же баг, что и в PhotoGridText/ThemePhoto (QA: "непонятно, к какой
 * фотке относить текст"). Теперь одна колонка; если текста мало, весь
 * блок лид+абзацы+достижения+цитата центрируется в оставшемся под
 * портретами пространстве, а не прилипает к верху.
 */
export function TeamFaces({ issue, pageNumber }: { issue: Issue; pageNumber: 4 }) {
  const { title, subtitle, lead, paragraphs, achievements, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const faces = photos.slice(0, 3);
  const heightMm = photoHeightMm(faces.length);
  const hasBelowPhotos =
    Boolean(lead) || paragraphs.length > 0 || achievements.length > 0 || quotes.length > 0;

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      <div className="flex h-full flex-col">
        <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

        {/* Заголовок → фото уплотнён (единая "плотность как на обложке"
            для всех внутренних шаблонов) — было 5мм. */}
        {faces.length > 0 && (
          <div
            data-zone="photo"
            className="mt-[4mm] grid flex-shrink-0 gap-[4mm]"
            style={{ gridTemplateColumns: `repeat(${faces.length}, 1fr)` }}
          >
            {faces.map((p) => (
              <div key={p.id}>
                <div className="overflow-hidden bg-olive/10" style={{ height: `${heightMm}mm` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.personName ?? p.caption ?? ""} className="h-full w-full object-cover" />
                </div>
                {(p.personName || p.personRole) && (
                  <div data-zone="caption" className="mt-[1.5mm]">
                    {p.personName && (
                      <p className="font-display text-[9px] font-bold uppercase leading-tight">
                        {p.personName}
                      </p>
                    )}
                    {p.personRole && (
                      <p className="mt-[0.5mm] font-body text-[6.5px] uppercase tracking-wide text-olive-dim">
                        {p.personRole}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasBelowPhotos && (
          // Было flex-1 justify-center — центрирование в оставшемся под
          // портретами пространстве (задумывалось для случая "текста
          // мало"), но при реальном объёме текста это выглядело как
          // огромный отступ от фото (QA, скриншот с размеченными
          // отступами: "текстовый блок поднять выше, на величину отступа
          // заголовка от фото" — тот же 4мм, что и у заголовка над
          // фото, а не подвешенный где-то в середине пространства).
          // Текст теперь всегда прижат к фото на 4мм, без центрирования.
          <div className="mt-[4mm] flex flex-1 flex-col">
            {/* Ширина текста — во всю ширину строки портретов выше, а не
                уже её (QA: "можно ли текст выровнять по ширине
                изображения" — портрет(ы) занимают всю ширину контентной
                колонки через grid выше, а текст был искусственно сужен
                до 140мм, оставляя лишний воздух справа). Цитата
                (PullQuote) намеренно остаётся у́же — тот же приём
                акцентной узкой колонки для цитаты используется во всех
                внутренних шаблонах (ArticlePhoto/ThemePhoto/
                PhotoGridText), это не текст статьи. */}
            {lead && (
              <p data-zone="lead" className="font-body text-[18px] font-bold leading-[1.6] text-ink">
                {lead.text}
              </p>
            )}

            {paragraphs.length > 0 && (
              <div className={`space-y-[3mm] text-[16px] leading-[1.6] text-ink/90 ${lead ? "mt-[3mm]" : ""}`}>
                {paragraphs.map((p) => (
                  <p key={p.id} data-zone="paragraph" className="font-body">
                    {p.text}
                  </p>
                ))}
              </div>
            )}

            {achievements.length > 0 && (
              <div
                data-zone="achievement"
                className={lead || paragraphs.length > 0 ? "mt-[4mm]" : ""}
              >
                <ul className="space-y-[1.5mm]">
                  {achievements.map((a) => (
                    <li key={a.id} className="flex items-baseline gap-[2mm] font-body text-[8px] text-ink/90">
                      <span className="text-accent">—</span>
                      <span>{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {quotes.length > 0 && (
              <div
                className={`max-w-[110mm] space-y-[3mm] ${
                  lead || paragraphs.length > 0 || achievements.length > 0 ? "mt-[4mm]" : ""
                }`}
              >
                {quotes.map((q) => (
                  <PullQuote key={q.id} text={q.text} author={q.author} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </InnerPageShell>
  );
}
