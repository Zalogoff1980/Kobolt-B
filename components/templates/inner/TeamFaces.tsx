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
 */
export function TeamFaces({ issue, pageNumber }: { issue: Issue; pageNumber: 4 }) {
  const { title, subtitle, lead, paragraphs, achievements, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const faces = photos.slice(0, 3);
  const quote = quotes[0];
  const heightMm = photoHeightMm(faces.length);

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

      {faces.length > 0 && (
        <div
          data-zone="photo"
          className="mt-[5mm] grid gap-[4mm]"
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

      {/* Основной текст/лид — отдельное семантическое поле, крупнее и
          жирнее обычных абзацев, полной шириной над многоколоночным
          телом. */}
      {lead && (
        <p data-zone="lead" className="mt-[5mm] max-w-[140mm] font-body text-[9.5px] font-bold leading-relaxed text-ink">
          {lead.text}
        </p>
      )}

      {paragraphs.length > 0 && (
        <div
          className={`mt-[5mm] gap-[6mm] text-[8.5px] leading-relaxed text-ink/90 ${
            paragraphs.length > 1 ? "columns-2 [column-fill:balance]" : ""
          }`}
          style={paragraphs.length === 1 ? { maxWidth: "130mm" } : undefined}
        >
          {paragraphs.map((p) => (
            <p key={p.id} data-zone="paragraph" className="mb-[3mm] break-inside-avoid font-body">
              {p.text}
            </p>
          ))}
        </div>
      )}

      {achievements.length > 0 && (
        <div data-zone="achievement" className="mt-[4mm] max-w-[140mm]">
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

      {quote && (
        <div className="mt-[4mm] max-w-[110mm]">
          <PullQuote text={quote.text} author={quote.author} />
        </div>
      )}
    </InnerPageShell>
  );
}
