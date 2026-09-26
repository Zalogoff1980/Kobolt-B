import { Emblem } from "./Emblem";
import { IssueMeta } from "./IssueMeta";
import { EditorialRule } from "@/components/shared/EditorialRule";

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

      {/* Дивайдер над шапкой — симметрия с тем, что уже есть в макете
          cover-v2 (найдено QA: "дивайдер, который есть в макете
          титульный лист, исчез" — здесь, в cover-v1, его не было
          вовсе). Тот же variant="double", что и обычная тонкая линия
          на фоновой гравюре практически не видна. */}
      <EditorialRule variant="double" className="mt-[3mm]" />

      <div className="mt-[5mm] grid grid-cols-[26mm_1fr_26mm] items-start gap-[4mm]">
        <Emblem
          imageSrc="/emblems/emblem-tank-corps.png"
          label="Танковые войска"
          sublabel="Броня соединяет людей"
          shape="circle"
        />

        <div className="text-center">
          {/* Заголовок в одну строку, крупнее (QA: "танковый батальон
              в одну строку... смотрится куцо, увеличить шрифт, чтобы
              гармонично смотрелось с гербами") — раньше два слова были
              раздельными блочными строками на 34px, из-за чего заметная
              часть ширины центральной колонки оставалась пустой рядом
              с гербами. */}
          <h1 className="whitespace-nowrap font-display text-[42px] font-bold uppercase leading-none tracking-tight">
            <span className="text-ink">Танковый</span>{" "}
            <span className="text-olive">Батальон</span>
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
          imageSrc="/emblems/emblem-shavlinsky.png"
          label="Шавлинский полк"
          sublabel="Вместе к новым победам"
          shape="shield"
        />
      </div>
    </header>
  );
}
