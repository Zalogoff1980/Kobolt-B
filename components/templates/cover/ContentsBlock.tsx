import { EditorialRule } from "@/components/shared/EditorialRule";

export type ContentsEntry = {
  pageNumber: number;
  /** Заголовок материала страницы — берётся из первого heading-блока
   *  этой страницы. Если его ещё нет, entry.title не задан: мы не
   *  подставляем выдуманный текст (ТЗ п.4), а помечаем это нейтрально,
   *  как состояние интерфейса, а не как редакционный контент. */
  title?: string;
  thumbnailSrc?: string;
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
                <p className="mt-[1mm] font-display text-[7px] font-bold uppercase text-olive-dim">
                  Стр. {entry.pageNumber}
                </p>
              </div>
              {entry.thumbnailSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.thumbnailSrc}
                  alt=""
                  className="h-[14mm] w-[18mm] flex-shrink-0 object-cover"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
