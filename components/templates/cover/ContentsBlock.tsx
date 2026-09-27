import { EditorialRule } from "@/components/shared/EditorialRule";

export type ContentsEntry = {
  pageNumber: number;
  /** Заголовок материала страницы — берётся из первого heading-блока
   *  этой страницы. Если его ещё нет, entry.title не задан: мы не
   *  подставляем выдуманный текст (ТЗ п.4), а помечаем это нейтрально,
   *  как состояние интерфейса, а не как редакционный контент. */
  title?: string;
  thumbnailSrc?: string;
  /** Первые строки текста материала (лид или первый абзац статьи) —
   *  превью под заголовком в "В номере" (QA: "после заголовков выводить
   *  первые три-четыре строчки текста, типа текст превью"). Урезается
   *  по строкам через line-clamp, а не по числу символов — так длина
   *  превью не зависит от того, насколько длинные слова попались в
   *  начале конкретного текста. Необязательно: если у страницы ещё нет
   *  ни лида, ни абзацев, превью просто не показывается. */
  previewText?: string;
};

/** Блок "В НОМЕРЕ" — оглавление, полностью производное от текущего
 *  состава страниц выпуска. Ничего сверх реально существующих страниц
 *  не рисуется: если в Issue пока только страница 2, в списке будет
 *  одна запись, а не три "для красоты". */
export function ContentsBlock({ entries }: { entries: ContentsEntry[] }) {
  return (
    <div>
      <div className="bg-olive px-[3mm] py-[1.5mm]">
        <span className="font-display text-[10px] font-bold uppercase tracking-wide text-paper">
          В номере
        </span>
      </div>

      <ul className="mt-[3mm] space-y-[3mm]">
        {entries.map((entry, i) => (
          <li key={entry.pageNumber}>
            {i > 0 && <EditorialRule className="mb-[3mm]" />}
            <div className="flex items-start gap-[3mm]">
              <span className="font-display text-[20px] font-bold leading-none text-accent">
                {String(entry.pageNumber).padStart(2, "0")}
              </span>
              <div className="flex-1">
                {entry.title ? (
                  <p className="font-display text-[10px] font-bold uppercase leading-tight">
                    {entry.title}
                  </p>
                ) : (
                  <p className="font-body text-[8px] italic text-olive-dim">
                    Материал ещё не добавлен
                  </p>
                )}
                <p className="mt-[1mm] font-display text-[13px] font-bold uppercase text-olive-dim">
                  Стр. {entry.pageNumber}
                </p>
                {entry.previewText && (
                  <p className="mt-[1.5mm] line-clamp-4 font-body text-[7.5px] leading-snug text-ink/80">
                    {entry.previewText}
                  </p>
                )}
              </div>
              {entry.thumbnailSrc && (
                // Ширина миниатюры подтянута к правому краю hero-фото
                // выше (QA, с размеченными на скриншоте прямоугольниками):
                // в HeroMedia фото занимает flex-[2.1] из 3.1 суммарных
                // долей строки — то есть ~66.6% ширины полосы контента,
                // и заканчивается там же, где должна начинаться миниатюра
                // здесь. При ширине контента 186мм это ~62мм (было 18мм —
                // заметно мельче, чем в референсе). Высота увеличена с
                // 14мм до 30мм отдельным QA-шагом (было "смотрится очень
                // узко, нехорошо").
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.thumbnailSrc}
                  alt=""
                  className="h-[30mm] w-[62mm] flex-shrink-0 object-cover"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
