/** Разбивает сырой многострочный текст на отдельные новости — каждая
 *  непустая строка (после переноса) становится одной короткой
 *  заметкой. Пустые строки (лишние переносы при наборе) не создают
 *  пустых записей. */
function splitNews(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Блок "Новости" на обложке (cover-v1) — короткие заметки под списком
 * "В номере", во всю ширину страницы (ТЗ QA: "синий прямоугольничек,
 * туда мы разместим блок новости... заголовок новости и блок под него
 * текстовый"). Заголовок оформлен той же оливковой плашкой, что и "В
 * номере" — единый язык заголовков разделов обложки. Если текст ещё
 * не заполнен, блок не рендерится вовсе (ничего не выдумываем).
 */
export function NewsBlock({ rawText }: { rawText?: string | null }) {
  const items = splitNews(rawText ?? "");
  if (items.length === 0) return null;

  return (
    <div data-zone="news">
      <div className="bg-olive px-[3mm] py-[1.5mm]">
        <span className="font-display text-[10px] font-bold uppercase tracking-wide text-paper">
          Новости
        </span>
      </div>

      <ul className="mt-[3mm] space-y-[2mm]">
        {items.map((text, i) => (
          <li key={i} className="flex items-baseline gap-[2mm] font-body text-[8.5px] leading-relaxed text-ink/90">
            <span className="flex-shrink-0 text-accent">—</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
