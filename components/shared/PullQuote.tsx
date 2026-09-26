export function PullQuote({ text, author }: { text: string; author?: string }) {
  return (
    <div data-zone="quote" className="border-l-2 border-accent bg-olive/5 px-[4mm] py-[3mm]">
      <span className="font-display text-[18px] leading-none text-accent">“</span>
      <p className="font-display text-[10px] font-bold uppercase leading-snug">{text}</p>
      {author && (
        <p className="mt-[1.5mm] font-body text-[7px] uppercase tracking-wide text-olive-dim">
          {author}
        </p>
      )}
    </div>
  );
}
