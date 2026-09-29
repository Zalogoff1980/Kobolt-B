import { EngravingTank } from "@/components/decorative/EngravingTank";

type HeroHeadline = { lines: { text: string; accent?: boolean }[] };
type HeroQuote = { id: string; text: string; author?: string };
type HeroParagraph = { id: string; text: string };

/**
 * Главный визуальный блок обложки (ТЗ п.3: "главный визуальный блок").
 * Фото, заголовок-акцент и цитата — все три опциональны и приходят из
 * контента конкретного выпуска; ничего здесь не выдумывается, если
 * материала нет — колонка просто не рендерится и остаётся воздух
 * (ТЗ п.4).
 */
export function HeroMedia({
  photo,
  headline,
  subtitle,
  paragraphs,
  quotes,
}: {
  photo?: { src: string; caption?: string };
  headline?: HeroHeadline;
  /** Необязательная вторая строка под главным hero-заголовком (поле
   *  "Подзаголовок" редактора обложки, шаг 7) — набрана заметно мельче
   *  и без акцентного цвета, чтобы не спорить с headline. */
  subtitle?: string;
  /** Текстовый блок hero-колонки (найдено QA: без него колонка
   *  выглядит пустой, если материала мало и нет цитаты) — та же зона
   *  "paragraph", что и обычный абзац статьи на внутренних страницах,
   *  просто отрисован в hero-раскладке обложки. Необязателен —
   *  cover-v1 его не передаёт вовсе, вид не меняется. */
  paragraphs?: HeroParagraph[];
  /** Сколько угодно цитат (QA: "дать возможность добавлять такой блок
   *  сколько нужно" — раньше была ровно одна). */
  quotes?: HeroQuote[];
}) {
  const hasSideColumn = Boolean(
    headline || subtitle || (paragraphs && paragraphs.length > 0)
  );

  return (
    // Без фиксированной высоты на всей строке (QA: "цитата наехала на
    // новости" — при большом количестве текста/цитат в боковой колонке
    // контент вылезал за пределы фиксированных 96мм и накладывался на
    // следующий блок страницы, т.к. фото внутри было обрезано
    // overflow-hidden, а колонка с текстом — нет). Высота 96мм теперь
    // задана только самому фото; строка в целом растягивается по
    // высоте более высокого из двух — фото или колонки, — и соседний
    // блок ниже просто сдвигается вниз, а не перекрывается.
    <div className="flex gap-[3mm]">
      {/* Высота уменьшена с 96мм до 85мм (QA: реальный PDF-файл замерен
          напрямую через pdftoppm — низа страницы 1 не хватало ~15мм
          после ограничения "Новости"/"День в истории" line-clamp'ом;
          самый крупный и безопасный резерв места на этой странице —
          именно фото, у него нет содержательного текста, который
          могло бы обрезать). */}
      <div
        data-zone="photo"
        className={`relative h-[85mm] overflow-hidden bg-olive/10 ${hasSideColumn ? "flex-[2.1]" : "flex-1"}`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EngravingTank className="h-[55%] w-[80%] text-olive/30" />
          </div>
        )}
        {/* Цитата — врезкой в тело фото, правый нижний угол (QA:
            "к цитате применить правило быть в теле фотографии. Правый
            нижний угол" — раньше шла отдельным блоком в текстовой
            колонке справа). Отступ снизу равен отступу справа (QA:
            "отступ снизу тот же что и справа") — симметричный угловой
            отступ внутри фото, вне зависимости от того, есть ли
            подпись под фото. Плашка полностью непрозрачная, цветом
            страницы (bg-paper), а не белая полупрозрачная (QA,
            печатный экземпляр: "градиент убрать... сделать цветом
            фона") — на печати сквозь прежние 95% непрозрачности
            слегка проступал тёмный градиент подписи под фото
            (bg-gradient-to-t от caption ниже), из-за чего плашка
            выглядела неровной. Полная непрозрачность убирает
            просвечивание вместе со сменой цвета на фоновый. */}
        {quotes && quotes.length > 0 && (
          <div className="absolute bottom-[2mm] right-[2mm] max-w-[65%] space-y-[2mm]">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                data-zone="quote"
                className="border-l-2 border-accent bg-paper px-[3mm] py-[2.5mm]"
              >
                <p className="font-display text-[19px] font-bold uppercase leading-snug text-ink">
                  {quote.text}
                </p>
                {quote.author && (
                  <p className="mt-[1.5mm] font-body text-[11px] uppercase text-ink/80">
                    {quote.author}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {photo?.caption && (
          <div data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[3mm] py-[2mm]">
            <p className="font-body text-[11px] italic text-paper/90">{photo.caption}</p>
          </div>
        )}
      </div>

      {hasSideColumn && (
        // Было flex-1 justify-center — колонка заголовка/цитаты
        // центрировалась по вертикали в 96мм-строке hero-блока, из-за
        // чего верх заголовка не совпадал с верхом фото (QA, шаблон
        // "Боевой листок": "привязать верхнюю границу заголовка к
        // верхней границе изображения" — тот же принцип top-alignment,
        // что уже применён во всех внутренних шаблонах). Без
        // justify-center колонка по умолчанию прижата к началу (верху).
        <div className="flex flex-1 flex-col gap-0">
          {headline && (
            // Межстрочный интервал уменьшен (QA: "слишком разлетелось") —
            // стандартное правило 1,6×кегль рассчитано на связный текст
            // абзаца, а не на короткий многострочный заголовок-акцент:
            // при двух строках 19px оно давало заметно больше воздуха
            // между строками, чем внутри самих букв. leading-snug (1.375)
            // визуально плотнее, оставаясь читаемым.
            <h2 data-zone="h1" className="font-display text-[19px] font-bold uppercase leading-snug">
              {headline.lines.map((line) => (
                <span key={line.text} className={line.accent ? "text-accent" : ""}>
                  {line.text}
                  <br />
                </span>
              ))}
            </h2>
          )}

          {/* Подзаголовок подтянут к заголовку (QA: "под заголовок
              поднять вверх на 6-8 пикселей... чтобы соблюдалась
              единство блока") — было плоское gap-[6mm] на всей
              колонке, теперь у каждого элемента свой отступ сверху.
              Отступ уменьшен вдвое (QA, печатный экземпляр: "уменьшить
              на 50%" — было 4мм). */}
          {subtitle && (
            <p
              data-zone="h2"
              className={`font-display text-[13px] font-bold uppercase leading-snug tracking-wide text-olive-dim ${
                headline ? "mt-[2mm]" : ""
              }`}
            >
              {subtitle}
            </p>
          )}

          {/* Отступ перед текстом тоже уменьшен вдвое (QA: "то же" —
              та же правка, что и у отступа заголовок→подзаголовок
              выше). */}
          {paragraphs && paragraphs.length > 0 && (
            <div className={`space-y-[2mm] ${headline || subtitle ? "mt-[2mm]" : ""}`}>
              {paragraphs.map((p) => (
                <p key={p.id} data-zone="paragraph" className="font-body text-[16px] leading-[1.3] text-ink/90">
                  {p.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
