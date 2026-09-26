import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { BirthdaysBlock } from "./BirthdaysBlock";
import { PullQuote } from "@/components/shared/PullQuote";
import { EngravingTank } from "@/components/decorative/EngravingTank";

/** Число колонок сетки фото и их высота зависят от количества
 *  снимков — это и делает шаблон "адаптивным", а не фиксированной
 *  раскладкой под конкретное число фото.
 *
 *  Для 4+ фото высота дополнительно уменьшается по числу строк, а не
 *  остаётся фиксированной: 5 фото в 2 колонки дают 3 строки, и при
 *  неизменных 58мм на строку сетка вместе с текстом ниже перестаёт
 *  помещаться на A4 (обнаружено QA-тестом "большой объём" — сетка
 *  сама по себе выходила за пределы страницы примерно на 12мм).
 *  GRID_MAX_HEIGHT_MM — бюджет высоты, внутри которого сетка обязана
 *  остаться независимо от того, сколько строк фото потребуется. */
const GRID_GAP_MM = 3;
const GRID_MAX_HEIGHT_MM = 130;

function gridLayout(count: number): { cols: number; heightMm: number } {
  if (count <= 1) return { cols: 1, heightMm: 95 };
  if (count === 2) return { cols: 2, heightMm: 72 };
  if (count === 3) return { cols: 3, heightMm: 58 };
  const cols = 2;
  const rows = Math.ceil(count / cols);
  const heightMm = Math.floor((GRID_MAX_HEIGHT_MM - (rows - 1) * GRID_GAP_MM) / rows);
  return { cols, heightMm };
}

/**
 * Template B страницы "История" — "несколько фотографий + текст"
 * (ТЗ шаг 3). Фотогалерея сверху (её раскладка считается от числа
 * снимков), текст статьи — ниже, одной колонкой на всю ширину.
 *
 * Раньше текст был разложен через CSS columns-2 с автоматической
 * балансировкой браузером — из-за этого перенос абзацев между
 * "колонками" был недетерминирован и зависел от объёма текста, а не от
 * структуры контента (QA: "непонятно, как в блоке редактора к какой
 * фотке относить текст"). Заменено на простую одну колонку, как во
 * всех остальных внутренних шаблонах. Если текста мало, весь блок
 * лид+абзацы+цитата центрируется по высоте в оставшемся под фото
 * пространстве, а не повисает прижатым к верху с пустотой снизу (QA:
 * "если текста будет мало... остаётся много пространства").
 *
 * Отдельная композиция для РОВНО двух фото (QA, скриншот: "текст
 * выравнивался по ширине первого фото... справа на всю высоту по
 * ширине второго фото разместить блок наши именинники") — см.
 * isTwoColumnLayout ниже. При другом количестве фото колонок для
 * такого разделения физически нет, поэтому там остаётся прежняя
 * раскладка "сетка фото сверху, текст на всю ширину снизу".
 */
export function PhotoGridText({ issue, pageNumber }: { issue: Issue; pageNumber: 2 }) {
  const { title, subtitle, lead, paragraphs, photos, quotes, birthdays } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const { cols, heightMm } = gridLayout(photos.length);
  const isTwoColumnLayout = photos.length === 2;

  if (isTwoColumnLayout) {
    // noUncheckedIndexedAccess считает элементы деструктуризации массива
    // потенциально undefined даже после проверки photos.length === 2
    // строкой выше (найдено сборкой на Vercel: "'photoLeft' is possibly
    // 'undefined'") — используем photos[0]/photos[1] напрямую с
    // ненулевым утверждением, а не деструктуризацию: длина уже
    // гарантирована isTwoColumnLayout.
    const photoLeft = photos[0]!;
    const photoRight = photos[1]!;

    return (
      <InnerPageShell
        pageNumber={pageNumber}
        issueNumber={issue.number}
        issueDate={issue.date}
        backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
      >
        <div className="flex h-full flex-col">
          <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

          {/* Левая колонка — ровно ширина первого фото (текст под ним
              выровнен по этой же ширине, а не растянут на всю страницу,
              как раньше); правая — ширина второго фото, на всю
              оставшуюся высоту страницы занята "Наши именинники" (QA:
              "справа на всю высоту по ширине второго фото"). Обе
              колонки — одна grid-строка с теми же gap-[3mm], что и у
              исходной сетки фото, поэтому ширины колонок совпадают 1:1
              с шириной фото над ними. */}
          <div className="mt-[4mm] grid flex-1 grid-cols-2 gap-[3mm]">
            <div className="flex flex-col">
              <figure
                data-zone="photo"
                className="relative flex-shrink-0 overflow-hidden bg-olive/10"
                style={{ height: `${heightMm}mm` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoLeft.src}
                  alt={photoLeft.caption ?? ""}
                  className="h-full w-full object-cover"
                />
                {photoLeft.caption && (
                  <figcaption
                    data-zone="caption"
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]"
                  >
                    <span className="font-body text-[6.5px] italic text-paper/90">
                      {photoLeft.caption}
                    </span>
                  </figcaption>
                )}
              </figure>

              <div className="mt-[4mm] flex flex-1 flex-col justify-center">
                {lead && (
                  <p data-zone="lead" className="font-body text-[9.5px] font-bold leading-[1.6] text-ink">
                    {lead.text}
                  </p>
                )}
                {paragraphs.length > 0 && (
                  <div className={`space-y-[3mm] text-[8.5px] leading-[1.6] text-ink/90 ${lead ? "mt-[3mm]" : ""}`}>
                    {paragraphs.map((p) => (
                      <p key={p.id} data-zone="paragraph" className="font-body">
                        {p.text}
                      </p>
                    ))}
                  </div>
                )}
                {quotes.length > 0 && (
                  <div className={`space-y-[3mm] ${lead || paragraphs.length > 0 ? "mt-[4mm]" : ""}`}>
                    {quotes.map((q) => (
                      <PullQuote key={q.id} text={q.text} author={q.author} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <figure
                className="relative flex-shrink-0 overflow-hidden bg-olive/10"
                style={{ height: `${heightMm}mm` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoRight.src}
                  alt={photoRight.caption ?? ""}
                  className="h-full w-full object-cover"
                />
                {photoRight.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]">
                    <span className="font-body text-[6.5px] italic text-paper/90">
                      {photoRight.caption}
                    </span>
                  </figcaption>
                )}
              </figure>

              <div className="mt-[4mm] flex-1">
                <BirthdaysBlock entries={birthdays} />
              </div>
            </div>
          </div>
        </div>
      </InnerPageShell>
    );
  }

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      {/* Корневой блок — flex-column на всю высоту страницы: заголовок и
          фотогалерея сверху фиксированной высоты, текстовая секция ниже —
          flex-1 с центрированием, чтобы короткий текст не повисал
          прижатым к верху с пустотой снизу. ArticleTitle обязательно
          внутри ЭТОГО же flex-контейнера (а не снаружи) — иначе h-full
          у текстовой секции считался бы от родителя целиком, не оставляя
          места под уже занятую заголовком/фото высоту. */}
      <div className="flex h-full flex-col">
        <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

        {/* Заголовок → фото уплотнён (единая "плотность как на обложке"
            для всех внутренних шаблонов) — было 5мм. */}
        <div className="mt-[4mm] flex-shrink-0">
          {photos.length > 0 ? (
            <div
              data-zone="photo"
              className="grid gap-[3mm]"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {photos.map((p) => (
                <figure
                  key={p.id}
                  className="relative overflow-hidden bg-olive/10"
                  style={{ height: `${heightMm}mm` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                  {p.caption && (
                    <figcaption data-zone="caption" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-[2mm] py-[1.5mm]">
                      <span className="font-body text-[6.5px] italic text-paper/90">{p.caption}</span>
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <div data-zone="photo" className="flex h-[70mm] items-center justify-center bg-olive/10">
              <EngravingTank className="h-[50%] w-[60%] text-olive/30" />
            </div>
          )}
        </div>

        {/* Текст — одной колонкой на всю ширину (было: CSS columns-2 с
            непредсказуемым авто-балансом, из-за чего в редакторе не было
            понятно, к какой "колонке" относится абзац). Лид/абзацы/цитата
            центрируются как единый блок в оставшемся под фото
            пространстве — если текста мало, он не прилипает к верху. */}
        <div className="mt-[4mm] flex flex-1 flex-col justify-center">
          {lead && (
            <p data-zone="lead" className="max-w-[130mm] font-body text-[9.5px] font-bold leading-[1.6] text-ink">
              {lead.text}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className={`max-w-[130mm] space-y-[3mm] text-[8.5px] leading-[1.6] text-ink/90 ${lead ? "mt-[3mm]" : ""}`}>
              {paragraphs.map((p) => (
                <p key={p.id} data-zone="paragraph" className="font-body">
                  {p.text}
                </p>
              ))}
            </div>
          )}

          {quotes.length > 0 && (
            <div className={`max-w-[110mm] space-y-[3mm] ${lead || paragraphs.length > 0 ? "mt-[4mm]" : ""}`}>
              {quotes.map((q) => (
                <PullQuote key={q.id} text={q.text} author={q.author} />
              ))}
            </div>
          )}
        </div>
      </div>
    </InnerPageShell>
  );
}
