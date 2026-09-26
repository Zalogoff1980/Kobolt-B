import { PageSections } from "@/lib/content/sections";

type Birthday = PageSections["birthdays"][number];

/**
 * Блок "Наши именинники" — правая колонка Template B страницы 2
 * (photo-grid-v1, QA: "справа на всю высоту по ширине второго фото
 * разместить блок наши именинники... с возможностью добавить несколько
 * фамилий с датой... и текстом небольшого поздравления"). Заголовок —
 * та же оливковая плашка, что и у "Новости"/"День в истории" на
 * обложке (единый язык заголовков блоков по всему изданию). Если
 * список пуст — нейтральная заглушка, а не пустое место без объяснения.
 */
export function BirthdaysBlock({ entries }: { entries: Birthday[] }) {
  const items = entries.filter((b) => b.name.trim().length > 0);

  return (
    <div data-zone="birthdays" className="flex h-full flex-col">
      <div className="bg-olive px-[3mm] py-[1.5mm]">
        <span className="font-display text-[10px] font-bold uppercase tracking-wide text-paper">
          Наши именинники
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-[3mm] space-y-[3mm]">
          {items.map((b, i) => (
            <li key={b.id} className={i > 0 ? "border-t border-ink/15 pt-[3mm]" : ""}>
              <div className="flex items-baseline justify-between gap-[2mm]">
                <p className="font-display text-[9px] font-bold uppercase leading-tight text-ink">
                  {b.name}
                </p>
                {b.date && (
                  <span className="flex-shrink-0 font-display text-[8px] font-bold uppercase text-accent">
                    {b.date}
                  </span>
                )}
              </div>
              {b.message && (
                <p className="mt-[1mm] font-body text-[7.5px] italic leading-snug text-olive-dim">
                  {b.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[3mm] font-body text-[8px] italic text-olive-dim">
          Именинники ещё не добавлены
        </p>
      )}
    </div>
  );
}
