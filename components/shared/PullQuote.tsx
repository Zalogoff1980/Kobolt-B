export function PullQuote({
  text,
  author,
  uppercase = true,
}: {
  text: string;
  author?: string;
  /** Стр 4, шаблон "Лицо" (QA: "размер шрифта в цитате выполнить не
   *  капсом а обычным текстом") — там цитата не капсом, в отличие от
   *  всех остальных шаблонов, где капс остаётся дефолтом. */
  uppercase?: boolean;
}) {
  return (
    <div data-zone="quote" className="border-l-2 border-accent bg-olive/5 px-[4mm] py-[3mm]">
      {/* Кавычка убрана (QA: "убрать в нём кавычки") — акцентная левая
          линия border-accent уже достаточно маркирует блок как цитату. */}
      <p className={`font-display text-[19px] font-bold leading-snug ${uppercase ? "uppercase" : ""}`}>{text}</p>
      {author && (
        <p className="mt-[1.5mm] font-body text-[11px] uppercase tracking-wide text-olive-dim">
          {author}
        </p>
      )}
    </div>
  );
}
