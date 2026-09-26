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

      {/* Раньше — плоский список, одна строка = одна новость (QA:
          "плохо смотрится"). Теперь сетка в 2 колонки, каждая новость —
          с крупным акцентным номером и тонкой линейкой сверху, тот же
          язык, что и у пронумерованных записей "В номере" рядом — а не
          безликий список тире. */}
      <div className="mt-[3mm] grid grid-cols-2 gap-x-[6mm] gap-y-[3mm]">
        {items.map((text, i) => (
          <div key={i} className="border-t border-ink/15 pt-[2mm]">
            <div className="flex items-start gap-[2mm]">
              <span className="flex-shrink-0 font-display text-[13px] font-bold leading-none text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-[8px] leading-snug text-ink/90">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
