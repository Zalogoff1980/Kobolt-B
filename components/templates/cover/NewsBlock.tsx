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
 * Блок "Новости" на обложке (cover-v1/v2) — небольшая колонка справа от
 * списка "В номере", по ширине совпадающая с текстовой колонкой
 * hero-строки выше (flex-1 из тех же 3.1 долей, что и там — см.
 * CoverV1/CoverV2). Раньше был во всю ширину страницы под списком; QA
 * пересмотрел композицию: "разместить превью... выровнять их по
 * правому краю верхней картинки, а справа, в освободившемся месте,
 * вставить блок с новостями... небольшой блок новостей" — то есть
 * низ страницы теперь повторяет ту же пропорцию колонок (фото|текст),
 * что и hero-строка сверху. Заголовок — та же оливковая плашка, что и
 * "В номере", подписана "Новости". Если текст ещё не заполнен, блок
 * не рендерится вовсе (ничего не выдумываем).
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

      {/* Узкая колонка (было: сетка в 2 колонки во всю ширину страницы)
          — здесь одна колонка, короткие заметки друг под другом с
          тонкой линейкой между ними, тот же акцентный номер, что и у
          записей "В номере" рядом. */}
      <ul className="mt-[3mm] space-y-[2.5mm]">
        {items.map((text, i) => (
          <li key={i} className={i > 0 ? "border-t border-ink/15 pt-[2.5mm]" : ""}>
            <div className="flex items-start gap-[2mm]">
              <span className="flex-shrink-0 font-display text-[11px] font-bold leading-none text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-[7.5px] leading-snug text-ink/90">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
