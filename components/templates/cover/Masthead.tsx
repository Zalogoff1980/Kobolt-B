import { Emblem } from "./Emblem";
import { IssueMeta } from "./IssueMeta";

const DEFAULT_TAGLINE = ["СИЛА", "В ДВИЖЕНИИ", "ЧЕСТЬ", "БРАТСТВО", "ПОБЕДА"];

/**
 * Шапка титульного листа: девиз-строка + эмблемы части и полка по
 * бокам + заголовок издания в центре (ТЗ п.3). Постоянная часть —
 * структура и данные из Issue; сами эмблемы — слоты (см. Emblem.tsx),
 * пока без привязанных файлов.
 */
export function Masthead({
  issueNumber,
  issueDate,
  tagline = DEFAULT_TAGLINE,
}: {
  issueNumber: string;
  issueDate: string;
  tagline?: string[];
}) {
  return (
    <header>
      <div className="flex items-center justify-center gap-[2mm] font-display text-[7px] font-bold uppercase tracking-[0.15em] text-olive-dim">
        {tagline.map((word, i) => (
          <span key={word} className="flex items-center gap-[2mm]">
            {i > 0 && <span className="text-accent">•</span>}
            {word}
          </span>
        ))}
      </div>

      <div className="mt-[3mm] grid grid-cols-[26mm_1fr_26mm] items-start gap-[4mm]">
        <Emblem
          imageSrc="/emblems/emblem-tank-corps.jpg"
          label="Танковые войска"
          sublabel="Броня соединяет людей"
          shape="circle"
        />

        <div className="text-center">
          <h1 className="font-display text-[34px] font-bold uppercase leading-[0.88] tracking-tight">
            <span className="block text-ink">Танковый</span>
            <span className="block text-olive">Батальон</span>
          </h1>

          <div className="mx-auto mt-[2mm] inline-block -rotate-1 bg-accent px-[4mm] py-[1mm]">
            <span className="font-display text-[15px] font-bold uppercase tracking-wide text-paper">
              Боевой листок
            </span>
          </div>

          <p className="mt-[2mm] font-body text-[7.5px] uppercase tracking-wide text-olive-dim">
            Внутреннее издание танкового батальона
          </p>

          <div className="mt-[2.5mm] flex justify-center">
            <IssueMeta number={issueNumber} date={issueDate} />
          </div>
        </div>

        <Emblem
          imageSrc="/emblems/emblem-shavlinsky.jpg"
          label="Шавлинский полк"
          sublabel="Вместе к новым победам"
          shape="shield"
        />
      </div>
    </header>
  );
}
