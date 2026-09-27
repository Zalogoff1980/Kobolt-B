import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { awardById } from "@/components/decorative/awards/registry";

/** Высота портретов зависит от их числа (1–3, как задано ТЗ шага 5) —
 *  но, в отличие от пейзажных фото других страниц, кадр держится
 *  крупным при любом количестве: люди — главный визуальный элемент
 *  страницы, а не иллюстрация к тексту. Значения уменьшены относительно
 *  прежних (было 140/115/95) — карточка человека (QA-референс,
 *  сентябрь 2026) теперь несёт больше своего контента (имя над фото,
 *  роль/био/награды под ним), фото должно оставить им место. */
function photoHeightMm(count: number): number {
  if (count <= 1) return 115;
  if (count === 2) return 95;
  return 80;
}

/**
 * Страница 4, Template B — "Команда" (ТЗ шаг 5): 2–3 карточки людей,
 * общий текст, список достижений/наград (если есть), при необходимости
 * цитата. Как и в Template A — если фото нет вовсе, ряд портретов
 * просто не рендерится: гравюрная заглушка здесь неуместна (это
 * страница о конкретных людях).
 *
 * Карточка человека переработана под макет-референс (QA, сентябрь
 * 2026, инфографика "Лица батальона"): имя/звание НАД фото, короткая
 * цитата человека РЯДОМ с фото (а не общий page-level quote-блок), под
 * фото — короткая роль жирным ("Командир танка."), абзац-био и список
 * наград со значками. Реплика/био/награды хранятся прямо на photo-блоке
 * (personQuote/personBio/awardIds) — они принадлежат конкретному
 * человеку, а не общим полям страницы.
 *
 * Остальная часть страницы (заголовок/подзаголовок, общий лид/абзацы,
 * достижения, общая цитата) НЕ тронута этим шагом — QA выбрал
 * ограниченный объём переработки ("только карточки людей"), эти поля
 * по-прежнему рендерятся одним общим блоком ниже, как раньше.
 *
 * Текст раньше шёл через CSS columns-2 с авто-балансом браузера — тот
 * же баг, что и в PhotoGridText/ThemePhoto (QA: "непонятно, к какой
 * фотке относить текст"). Теперь одна колонка; если текста мало, весь
 * блок лид+абзацы+достижения+цитата центрируется в оставшемся под
 * портретами пространстве, а не прилипает к верху.
 */
export function TeamFaces({ issue, pageNumber }: { issue: Issue; pageNumber: 4 }) {
  const { title, subtitle, lead, paragraphs, achievements, photos, quotes } = groupPageBlocks(
    issue.pages[pageNumber].content.blocks
  );
  const faces = photos.slice(0, 3);
  const heightMm = photoHeightMm(faces.length);
  // quotes (общая цитата страницы) больше не рендерится здесь отдельным
  // блоком — теперь она врезкой поверх фото первого человека (см. ниже),
  // поэтому в этот флаг больше не входит.
  const hasBelowPhotos = Boolean(lead) || paragraphs.length > 0 || achievements.length > 0;

  return (
    <InnerPageShell
      pageNumber={pageNumber}
      issueNumber={issue.number}
      issueDate={issue.date}
      backgroundEngravingId={issue.pages[pageNumber].backgroundEngravingId}
    >
      <div className="flex h-full flex-col">
        <ArticleTitle title={title?.text} subtitle={subtitle?.text} />

        {/* Заголовок → фото уплотнён (единая "плотность как на обложке"
            для всех внутренних шаблонов) — было 5мм. */}
        {faces.length > 0 && (
          <div
            data-zone="photo"
            className="mt-[4mm] grid flex-shrink-0 gap-[5mm]"
            style={{ gridTemplateColumns: `repeat(${faces.length}, 1fr)` }}
          >
            {faces.map((p, i) => (
              <div key={p.id} className="flex flex-col">
                {/* Имя/звание — НАД фото (QA-референс), а не подписью
                    под ним, как было раньше. Одна строка может занимать
                    несколько строк текста (звание + фамилия + имя +
                    отчество вводятся одним полем), высота фото ниже не
                    подстраивается под неё — карточка просто немного
                    ужимает высоту оставшегося текста. */}
                {p.personName && (
                  <p className="font-display text-[10px] font-bold uppercase leading-tight text-ink">
                    {p.personName}
                  </p>
                )}

                {/* Фото во всю ширину строки, цитата(ы) — врезкой ПОВЕРХ
                    фото, правый нижний угол (QA: "саму цитату выполнить
                    поверх фото, с теми же настройками как цитата на 1
                    странице шаблон боевой листок" — то же оформление,
                    что и у HeroMedia: border-l-2 border-accent,
                    непрозрачная bg-paper плашка, font-display uppercase
                    bold 19px, без кавычек). Раньше личная цитата шла
                    РЯДОМ с фото отдельной колонкой (более ранний
                    QA-референс) — этот шаг заменяет то решение оверлеем,
                    как на обложке.

                    Общая цитата страницы (quotes, редактируется отдельно
                    от полей человека — именно её показывал QA на
                    скриншоте) якорится к ПЕРВОМУ фото (i === 0): у неё
                    нет привязки к конкретному человеку, а первое фото —
                    единственный однозначный якорь, когда людей 2-3.
                    Если на этом же фото есть ещё и personQuote — обе
                    плашки просто складываются в один стек (space-y),
                    как HeroMedia уже делает при нескольких цитатах. */}
                <div
                  className={`relative overflow-hidden bg-olive/10 ${p.personName ? "mt-[2mm]" : ""}`}
                  style={{ height: `${heightMm}mm` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.personName ?? p.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                  {(p.personQuote || (i === 0 && quotes.length > 0)) && (
                    <div className="absolute bottom-[2mm] right-[2mm] max-w-[65%] space-y-[2mm]">
                      {p.personQuote && (
                        <div data-zone="quote" className="border-l-2 border-accent bg-paper px-[3mm] py-[2.5mm]">
                          <p className="font-display text-[19px] font-bold uppercase leading-snug text-ink">
                            {p.personQuote}
                          </p>
                        </div>
                      )}
                      {i === 0 &&
                        quotes.map((q) => (
                          <div key={q.id} data-zone="quote" className="border-l-2 border-accent bg-paper px-[3mm] py-[2.5mm]">
                            <p className="font-display text-[19px] font-bold uppercase leading-snug text-ink">
                              {q.text}
                            </p>
                            {q.author && (
                              <p className="mt-[1.5mm] font-body text-[11px] uppercase text-ink/80">
                                {q.author}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {(p.personRole || p.personBio || (p.awardIds && p.awardIds.length > 0)) && (
                  <div data-zone="caption" className="mt-[2mm]">
                    {p.personRole && (
                      <p className="font-display text-[10px] font-bold text-ink">{p.personRole}.</p>
                    )}
                    {p.personBio && (
                      <p className="mt-[1mm] font-body text-[9px] leading-snug text-ink/90">
                        {p.personBio}
                      </p>
                    )}

                    {/* Награды — значок + название, В СТРОКУ, а не
                        столбиком (QA: "мелко и в столбик, лучше крупно
                        и в строку, ориентировочно чтобы все шесть
                        уместились в ширину фото"). Неизвестные/ещё не
                        существующие id молча пропускаются — на случай,
                        если award была выбрана, а потом убрана из
                        реестра.

                        Каждая награда — своя колонка (flex-1, поровну
                        делят ширину фото сверху), значок над подписью,
                        а не рядом с ней в строке: горизонтальный список
                        "иконка+текст" при 6 наградах в одну строку не
                        уместился бы по ширине. Значок крупнее прежнего
                        (17×32мм против 7.5×14мм) — при делении на 6
                        колонок это всё ещё укладывается в ширину фото
                        (~186мм контентной колонки / 6 ≈ 31мм на
                        колонку). */}
                    {p.awardIds && p.awardIds.length > 0 && (
                      <div className={p.personRole || p.personBio ? "mt-[2mm]" : ""}>
                        {/* "Награждён:" — тот же шрифт/размер, что и
                            заголовок "День в истории:" на обложке (QA,
                            со скриншотом первой страницы для сравнения:
                            "тем же шрифтом и размером") — было
                            text-[8px], стало text-[15px] leading-none,
                            тот же text-olive. */}
                        <p className="font-display text-[15px] font-bold uppercase leading-none tracking-wide text-olive">
                          Награждён:
                        </p>
                        {/* Разделительные линии между наградами (QA,
                            скриншот-разметка) — divide-x рисует тонкую
                            вертикальную границу между соседними
                            колонками автоматически, никаких лишних
                            обёрток. Подпись увеличена (QA: "названия
                            наград крупнее") — было text-[7.5px]. */}
                        <div className="mt-[1.5mm] flex items-start justify-between divide-x divide-ink/20">
                          {p.awardIds.map((awardId) => {
                            const award = awardById(awardId);
                            if (!award) return null;
                            return (
                              <div
                                key={awardId}
                                className="flex flex-1 flex-col items-center px-[2mm] text-center first:pl-0 last:pr-0"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={award.src}
                                  alt=""
                                  className="h-[32mm] w-[17mm] flex-shrink-0 object-contain"
                                />
                                <span className="mt-[1mm] font-body text-[10px] leading-snug text-ink/90">
                                  {award.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasBelowPhotos && (
          // Было flex-1 justify-center — центрирование в оставшемся под
          // портретами пространстве (задумывалось для случая "текста
          // мало"), но при реальном объёме текста это выглядело как
          // огромный отступ от фото (QA, скриншот с размеченными
          // отступами: "текстовый блок поднять выше, на величину отступа
          // заголовка от фото" — тот же 4мм, что и у заголовка над
          // фото, а не подвешенный где-то в середине пространства).
          // Текст теперь всегда прижат к фото на 4мм, без центрирования.
          <div className="mt-[4mm] flex flex-1 flex-col">
            {/* Ширина текста — во всю ширину строки портретов выше, а не
                уже её (QA: "можно ли текст выровнять по ширине
                изображения" — портрет(ы) занимают всю ширину контентной
                колонки через grid выше, а текст был искусственно сужен
                до 140мм, оставляя лишний воздух справа). Цитата страницы
                сюда больше не относится — она теперь оверлеем поверх
                первого фото выше, не в этом текстовом блоке. */}
            {lead && (
              <p data-zone="lead" className="font-body text-[19px] font-bold leading-[1.6] text-ink">
                {lead.text}
              </p>
            )}

            {paragraphs.length > 0 && (
              <div className={`space-y-[3mm] text-[16px] leading-[1.3] text-ink/90 ${lead ? "mt-[3mm]" : ""}`}>
                {paragraphs.map((p) => (
                  <p key={p.id} data-zone="paragraph" className="font-body">
                    {p.text}
                  </p>
                ))}
              </div>
            )}

            {/* Разделитель перед достижениями (QA: "после наград
                горизонтальный разделитель") — тонкая линия + отступ,
                тот же приём, что и между записями "День в истории"/
                "Новости" на обложке, вместо голого margin-top.
                Заголовок "Достижения:" тем же шрифтом/размером, что и
                "Награждён:" у наград выше (QA: "тем же шрифтом что
                Награждён").

                Каждое достижение — карточка "как цитата, но без
                кавычек" (QA): та же левая акцентная линия, что и у
                PullQuote (border-l-2 border-accent), но со своей
                заливкой — bg-paper/80 (цвет фона страницы, 80%
                непрозрачности — QA: "подложка цвета фона с
                прозрачностью 80"), а не олива PullQuote и без
                уппercase/жирного цитатного начертания (текст
                достижения — обычный, 16px). В строку, не столбиком
                (QA: "в строку, в ширину фото, 4 штуки чтоб можно
                было заложить") — flex-wrap с basis≈45мм даёт 4 карточки
                на ширину фото (~186мм / 4), при большем числе —
                перенос на следующую строку, а не сжатие. */}
            {achievements.length > 0 && (
              <div
                data-zone="achievement"
                className="mt-[4mm] border-t border-ink/15 pt-[3mm]"
              >
                <p className="font-display text-[15px] font-bold uppercase leading-none tracking-wide text-olive">
                  Достижения:
                </p>
                <div className="mt-[2mm] flex flex-wrap gap-[2mm]">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      className="min-w-0 flex-1 basis-[45mm] border-l-2 border-accent bg-paper/80 px-[3mm] py-[2mm]"
                    >
                      <p className="font-body text-[16px] leading-snug text-ink/90">{a.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InnerPageShell>
  );
}
