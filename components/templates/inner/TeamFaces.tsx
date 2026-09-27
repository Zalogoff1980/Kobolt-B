import { Issue } from "@/lib/content/issue";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { InnerPageShell } from "./InnerPageShell";
import { ArticleTitle } from "./ArticleTitle";
import { PullQuote } from "@/components/shared/PullQuote";
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
  const hasBelowPhotos =
    Boolean(lead) || paragraphs.length > 0 || achievements.length > 0 || quotes.length > 0;

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
            {faces.map((p) => (
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

                {/* Фото + короткая цитата человека рядом (QA-референс:
                    речь человека вынесена в сторону от портрета, а не
                    общим page-level quote-блоком). Если цитаты нет —
                    фото просто занимает всю ширину строки. */}
                <div
                  className={`flex gap-[2.5mm] ${p.personName ? "mt-[2mm]" : ""}`}
                  style={{ height: `${heightMm}mm` }}
                >
                  <div
                    className={`overflow-hidden bg-olive/10 ${p.personQuote ? "flex-[1.3]" : "flex-1"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.personName ?? p.caption ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {p.personQuote && (
                    <div className="flex flex-1 items-center">
                      <p className="font-body text-[10px] italic leading-snug text-ink/80">
                        «{p.personQuote}»
                      </p>
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
                до 140мм, оставляя лишний воздух справа). Цитата
                (PullQuote) намеренно остаётся у́же — тот же приём
                акцентной узкой колонки для цитаты используется во всех
                внутренних шаблонах (ArticlePhoto/ThemePhoto/
                PhotoGridText), это не текст статьи. */}
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
                Награждён"); сама строка достижения увеличена до 16px
                (QA: "шрифт покрупней, 12pt" — 12pt ≈ 16px, тот же
                кегль, что и у обычного абзаца статьи). */}
            {achievements.length > 0 && (
              <div
                data-zone="achievement"
                className="mt-[4mm] border-t border-ink/15 pt-[3mm]"
              >
                <p className="font-display text-[15px] font-bold uppercase leading-none tracking-wide text-olive">
                  Достижения:
                </p>
                <ul className="mt-[2mm] space-y-[2mm]">
                  {achievements.map((a) => (
                    <li key={a.id} className="flex items-baseline gap-[2mm] font-body text-[16px] leading-snug text-ink/90">
                      <span className="text-accent">—</span>
                      <span>{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {quotes.length > 0 && (
              <div
                className={`max-w-[110mm] space-y-[3mm] ${
                  lead || paragraphs.length > 0 || achievements.length > 0 ? "mt-[4mm]" : ""
                }`}
              >
                {quotes.map((q) => (
                  <PullQuote key={q.id} text={q.text} author={q.author} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </InnerPageShell>
  );
}
