import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";

/**
 * Страница 4 ("Лица батальона"), Template A — "Лицо" (ТЗ шаг 5): один
 * человек — крупный портрет, имя/должность/позывной (если указаны),
 * текст о нём, при необходимости короткая цитата.
 *
 * Важное отличие от остальных внутренних страниц: если фото ещё нет,
 * здесь НЕТ гравюрной заглушки вместо портрета (в отличие от
 * ArticlePhoto/ThemePhoto). Силуэт танка на месте лица человека читался
 * бы нелепо — в финальном режиме пустой слот просто не занимает места,
 * текст занимает всю ширину.
 */
export function PersonFeature({ issue, pageNumber }: { issue: Issue; pageNumber: 4 }) {
  const { title, subtitle, lead, paragraphs, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const photo = photos[0];
  const quote = quotes[0];
  // personName/personRole — поля самого фото-блока; без фото им просто
  // неоткуда взяться, поэтому "кредит" осмыслен только в ветке с фото
  // ниже (строка ~55). Раньше здесь был ещё и вариант "нет фото, но
  // есть имя" — компилятор (noUncheckedIndexedAccess + строгая
  // narrowing) верно доказал, что при !photo это недостижимый код:
  // personName/personRole взять неоткуда, если photo вообще нет.
  const hasCredit = Boolean(photo?.personName || photo?.personRole);

  const textColumn = (
    <div className={photo ? "" : "max-w-[130mm]"}>
      <div className="space-y-[3mm]">
        {/* Основной текст/лид — отдельное семантическое поле, крупнее
            и жирнее обычных абзацев. */}
        {lead && (
          <p className="font-body text-[9.5px] font-bold leading-relaxed text-ink">{lead.text}</p>
        )}
        {paragraphs.map((p) => (
          <p key={p.id} className="font-body text-[8.5px] leading-relaxed text-ink/90">
            {p.text}
          </p>
        ))}
      </div>

      {quote && (
        <div className="mt-[4mm]">
          <PullQuote text={quote.text} author={quote.author} />
        </div>
      )}
    </div>
  );

  return (
    <InnerPageShell pageNumber={pageNumber} issueNumber={issue.number} issueDate={issue.date}>
      <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

      {photo ? (
        <div className="mt-[5mm] grid grid-cols-[68mm_1fr] items-start gap-[6mm]">
          <div>
            <div className="h-[130mm] overflow-hidden bg-olive/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.personName ?? photo.caption ?? ""} className="h-full w-full object-cover" />
            </div>
            {hasCredit && (
              <div className="mt-[2mm]">
                {photo.personName && (
                  <p className="font-display text-[11px] font-bold uppercase leading-tight">
                    {photo.personName}
                  </p>
                )}
                {photo.personRole && (
                  <p className="mt-[0.5mm] font-body text-[7.5px] uppercase tracking-wide text-olive-dim">
                    {photo.personRole}
                  </p>
                )}
              </div>
            )}
            {photo.caption && (
              <p className="mt-[1.5mm] font-body text-[7px] italic text-olive-dim">{photo.caption}</p>
            )}
          </div>

          {textColumn}
        </div>
      ) : (
        <div className="mt-[5mm]">{textColumn}</div>
      )}
    </InnerPageShell>
  );
}
