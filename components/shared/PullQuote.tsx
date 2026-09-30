export function PullQuote({
  text,
  author,
  uppercase = true,
  bold = true,
  sizePx = 19,
  leadingClassName = "leading-snug",
}: {
  text: string;
  author?: string;
  /** Стр 4, шаблон "Лицо" (QA: "размер шрифта в цитате выполнить не
   *  капсом а обычным текстом") — там цитата не капсом, в отличие от
   *  всех остальных шаблонов, где капс остаётся дефолтом. */
  uppercase?: boolean;
  /** Стр 4, шаблон "Лицо" (QA: "текст цитаты normal, не болд") — там
   *  цитата обычного начертания; везде ещё — жирная (дефолт). */
  bold?: boolean;
  /** Стр 4 (QA: "размер шрифта меньше на пункт-два", раз текст уже не
   *  болд) — там 17px вместо дефолтных 19. */
  sizePx?: number;
  /** Стр 4 (QA: "скорректировать межстрочный интервал") — там чуть
   *  просторнее (leading-normal), т.к. текст мельче и не болд. */
  leadingClassName?: string;
}) {
  return (
    <div data-zone="quote" className="border-l-2 border-accent bg-olive/5 px-[4mm] py-[3mm]">
      {/* Кавычка убрана (QA: "убрать в нём кавычки") — акцентная левая
          линия border-accent уже достаточно маркирует блок как цитату. */}
      <p
        className={`font-display ${leadingClassName} ${bold ? "font-bold" : "font-normal"} ${uppercase ? "uppercase" : ""}`}
        style={{ fontSize: `${sizePx}px` }}
      >
        {text}
      </p>
      {author && (
        <p className="mt-[1.5mm] font-body text-[11px] uppercase tracking-wide text-olive-dim">
          {author}
        </p>
      )}
    </div>
  );
}
