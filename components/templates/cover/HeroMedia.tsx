import { EngravingTank } from "@/components/decorative/EngravingTank";

type HeroHeadline = { lines: { text: string; accent?: boolean }[] };
type HeroQuote = { id: string; text: string; author?: string };
type HeroParagraph = { id: string; text: string };

/**
 * Главный визуальный блок обложки (ТЗ п.3: "главный визуальный блок").
 * Фото, заголовок-акцент и цитата — все три опциональны и приходят из
 * контента конкретного выпуска; ничего здесь не выдумывается, если
 * материала нет — колонка просто не рендерится и остаётся воздух
 * (ТЗ п.4).
 */
export function HeroMedia({
  photo,
  headline,
  subtitle,
  paragraphs,
  quotes,
}: {
  photo?: { src: string; caption?: string };
  headline?: HeroHeadline;
  /** Необязательная вторая строка под главным hero-заголовком (поле
   *  "Подзаголовок" редактора обложки, шаг 7) — набрана заметно мельче
   *  и без акцентного цвета, чтобы не спорить с headline. */
  subtitle?: string;
  /** Текстовый блок hero-колонки (найдено QA: без него колонка
   *  выглядит пустой, если материала мало и нет цитаты) — та же зона
   *  "paragraph", что и обычный абзац статьи на внутренних страницах,
   *  просто отрисован в hero-раскладке обложки. Необязателен —
   *  cover-v1 его не передаёт вовсе, вид не меняется. */
  paragraphs?: HeroParagraph[];
  /** Сколько угодно цитат (QA: "дать возможность добавлять такой блок
   *  сколько нужно" — раньше была ровно одна). */
  quotes?: HeroQuote[];
}) {
  const hasSideColumn = Boolean(
    headline || subtitle || (paragraphs && paragraphs.length > 0) || (quotes && quotes.length > 0)
  );

  return (
    <div className="flex gap-[3mm]" style={{ height: "96mm" }}>
      <div
        data-zone="photo"
        className={`relative overflow-hidden bg-olive/10 ${hasSideColumn ? "flex-[2.1]" : "flex-1"}`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EngravingTank className="h-[55%] w-[80%] text-olive/30" />
          </div>
        )}
        {photo?.caption && (
          <div data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[3mm] py-[2mm]">
            <p className="font-body text-[7.5px] italic text-paper/90">{photo.caption}</p>
          </div>
        )}
      </div>

      {hasSideColumn && (
        <div className="flex flex-1 flex-col justify-center gap-0">
          {headline && (
            <h2 data-zone="h1" className="font-display text-[19px] font-bold uppercase leading-[1.6]">
              {headline.lines.map((line) => (
                <span key={line.text} className={line.accent ? "text-accent" : ""}>
                  {line.text}
                  <br />
                </span>
              ))}
            </h2>
          )}

          {/* Подзаголовок подтянут к заголовку (QA: "под заголовок
              поднять вверх на 6-8 пикселей... чтобы соблюдалась
              единство блока") — было плоское gap-[6mm] на всей
              колонке, теперь у каждого элемента свой отступ сверху. */}
          {subtitle && (
            <p
              data-zone="h2"
              className={`font-display text-[10px] font-bold uppercase leading-[1.6] tracking-wide text-olive-dim ${
                headline ? "mt-[4mm]" : ""
              }`}
            >
              {subtitle}
            </p>
          )}

          {paragraphs && paragraphs.length > 0 && (
            <div className={`space-y-[2mm] ${headline || subtitle ? "mt-[4mm]" : ""}`}>
              {paragraphs.map((p) => (
                <p key={p.id} data-zone="paragraph" className="font-body text-[16px] leading-[1.6] text-ink/90">
                  {p.text}
                </p>
              ))}
            </div>
          )}

          {quotes && quotes.length > 0 && (
            <div
              className={`space-y-[3mm] ${
                headline || subtitle || (paragraphs && paragraphs.length > 0) ? "mt-[6mm]" : ""
              }`}
            >
              {quotes.map((quote) => (
                // Кавычка убрана (QA: "убрать в нём кавычки") — акцентная
                // левая линия border-accent уже маркирует блок как цитату.
                <div
                  key={quote.id}
                  data-zone="quote"
                  className="border-l-2 border-accent bg-olive/5 px-[3mm] py-[2.5mm]"
                >
                  <p className="font-display text-[9px] font-bold uppercase leading-snug">
                    {quote.text}
                  </p>
                  {quote.author && (
                    <p className="mt-[1.5mm] font-body text-[6.5px] uppercase text-olive-dim">
                      {quote.author}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
