export function PullQuote({ text, author }: { text: string; author?: string }) {
  return (
    <div data-zone="quote" className="border-l-2 border-accent bg-olive/5 px-[4mm] py-[3mm]">
      {/* Кавычка убрана (QA: "убрать в нём кавычки") — акцентная левая
          линия border-accent уже достаточно маркирует блок как цитату. */}
      <p className="font-display text-[19px] font-bold uppercase leading-snug">{text}</p>
      {author && (
        <p className="mt-[1.5mm] font-body text-[11px] uppercase tracking-wide text-olive-dim">
          {author}
        </p>
      )}
    </div>
  );
}
