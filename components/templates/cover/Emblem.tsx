type EmblemProps = {
  /** Реальное изображение эмблемы/герба (загружается в настройках части —
   *  появится вместе с формой редактирования Issue). Пока не подключено,
   *  показываем нейтральную рамку-заглушку, а не чужую символику. */
  imageSrc?: string;
  label: string;
  sublabel?: string;
  shape?: "circle" | "shield";
  /** Размер изображения герба в мм (только когда есть imageSrc) —
   *  по умолчанию 30мм; временный per-instance override для QA-примерки
   *  разного размера конкретного герба (пока размеры левого/правого
   *  не унифицированы окончательно). */
  sizeMm?: number;
};

/**
 * Слот постоянной символики (ТЗ п.1, п.3: "эмблема/герб... предусмотренную
 * дизайном"). Реальные знаки различия — не то, что можно достоверно
 * воспроизвести без официального файла части, поэтому компонент явно
 * рассчитан на подстановку изображения; без него — опрятная заглушка,
 * а не попытка нарисовать чужую геральдику "на глаз".
 */
export function Emblem({ imageSrc, label, sublabel, shape = "circle", sizeMm = 30 }: EmblemProps) {
  const frame =
    shape === "circle" ? "rounded-full" : "rounded-t-full rounded-b-md";

  return (
    <div className="flex flex-col items-center text-center" style={{ width: "32mm" }}>
      {imageSrc ? (
        // Реальное изображение герба уже несёт собственную рамку/форму
        // (нарисована художником) — оборачивать его ещё и в рамку-
        // заглушку (rounded-full/shield-заглушку) не нужно, получалось
        // два визуально спорящих контура (найдено QA). Просто крупнее,
        // ближе к пропорциям референса.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={label}
          className="object-contain opacity-70"
          style={{ height: `${sizeMm}mm`, width: `${sizeMm}mm` }}
        />
      ) : (
        <div
          className={`flex h-[20mm] w-[20mm] items-center justify-center border-2 border-ink/70 ${frame} bg-white/40`}
        >
          <span className="font-display text-[7px] font-bold uppercase leading-tight text-olive-dim">
            {label}
          </span>
        </div>
      )}
      {sublabel && (
        <p className="mt-[2mm] font-display text-[7.5px] font-bold uppercase leading-tight tracking-wide text-olive">
          {sublabel}
        </p>
      )}
    </div>
  );
}
