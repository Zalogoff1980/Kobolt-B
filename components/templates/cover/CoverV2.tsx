import type { CSSProperties } from "react";
import { Issue } from "@/lib/content/issue";
import { ContentBlock } from "@/lib/content/types";
import { groupPageBlocks } from "@/lib/content/pageBlocks";
import { PageFrame } from "@/components/canvas/PageFrame";
import { Emblem } from "./Emblem";
import { IssueMeta } from "./IssueMeta";
import { EditorialRule } from "@/components/shared/EditorialRule";
import { HeroMedia } from "./HeroMedia";
import { ContentsGrid } from "./ContentsGrid";
import { NewsBlock } from "./NewsBlock";

const TAGLINE = ["СИЛА", "В ДВИЖЕНИИ", "ЧЕСТЬ", "БРАТСТВО", "ПОБЕДА"];
const CLOSING_LINE = "Там, где другие останавливаются, танкисты идут вперёд.";

function firstOfType<T extends ContentBlock["type"]>(
  blocks: ContentBlock[],
  type: T
): Extract<ContentBlock, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as any;
}

/**
 * Шаблон обложки "cover-v2" — второй вариант оформления страницы 1
 * (второй пункт TEMPLATE_OPTIONS[1]), собранный по сетке, снятой с
 * присланного пользователем макета (шаг: "Разбери макет на сетку").
 * Использует ТУ ЖЕ модель контента страницы 1, что и cover-v1 (hero
 * heading level 2 / subtitle level 3 / photo / quote) — смена варианта
 * обложки через TemplatePicker не требует переввода контента, ровно
 * как и смена шаблона на страницах 2–4.
 *
 * Разметка страницы (мм, от верхнего края A4, поля 12mm — см. таблицу
 * сетки в переписке): тег-лайн ~7мм → шапка (эмблемы + крупный
 * заголовок + красная лента + подзаголовок + номер/дата) ~80мм →
 * двойная линейка → hero-блок (фото + заголовок/цитата) ~91мм →
 * линейка → блок "В номере" (список + сетка миниатюр 2×2) ~85мм →
 * закрывающая строка-девиз.
 */
export function CoverV2({ issue }: { issue: Issue }) {
  const coverBlocks = issue.pages[1].content.blocks;
  const heroPhoto = firstOfType(coverBlocks, "photo");
  // Сколько угодно цитат (QA: "дать возможность добавлять такой блок
  // сколько нужно" — раньше читалась только первая, firstOfType).
  const heroQuotes = coverBlocks.filter(
    (b): b is Extract<ContentBlock, { type: "quote" }> => b.type === "quote"
  );
  const heroHeading = coverBlocks.find((b) => b.type === "heading" && b.level === 2) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  const heroSubtitle = coverBlocks.find((b) => b.type === "heading" && b.level === 3) as
    | Extract<ContentBlock, { type: "heading" }>
    | undefined;
  // Текстовый блок hero-колонки (QA-находка: пусто, если материала
  // мало и нет цитаты) — groupPageBlocks достаточно и здесь: title/
  // subtitle из него не используются (обложка их читает сама выше по
  // своим level 2/3, а не по level 1/level!=1 — см. groupPageBlocks),
  // но группировка paragraphs одинакова для всех страниц.
  const { paragraphs } = groupPageBlocks(coverBlocks);

  return (
    <PageFrame backgroundEngravingId={issue.pages[1].backgroundEngravingId}>
      <div className="relative flex h-full flex-col px-[var(--page-margin)] py-[6mm]">
        {/* Тег-лайн ПЕРЕД верхним дивайдером (QA: "сначала текстовая
            строка... а потом дивайдер, вот тогда блок будет цельным") —
            тег-лайн и дивайдер вместе образуют одну "шапку шапки", а не
            дивайдер сам по себе висящий в воздухе над текстом. */}
        <div className="flex items-center justify-center gap-[2mm] font-display text-[7px] font-bold uppercase tracking-[0.2em] text-olive-dim">
          {TAGLINE.map((word, i) => (
            <span key={word} className="flex items-center gap-[2mm]">
              {i > 0 && <span className="text-accent">•</span>}
              {word}
            </span>
          ))}
        </div>

        {/* Дивайдер — симметрия с двойной линейкой ПОСЛЕ шапки (QA:
            "сверху разместить дивайдер... получается небольшой
            разброд"); без него блок тег-лайн+шапка висел у самого
            верха страницы ничем не отделённый. Тот же variant="double",
            что и внизу шапки — обычная тонкая линия (variant по
            умолчанию, 1px 25%-непрозрачности) на фоновой гравюре и
            текстуре бумаги оказалась практически незаметна (QA: "не
            вижу дивайдер"). */}
        <EditorialRule variant="double" className="mt-[2mm]" />

        {/* Шапка — крупнее, чем у cover-v1: заголовок издания несёт
            основной визуальный вес страницы (по макету). Заголовок
            почти во всю ширину центральной колонки (QA: "таких же
            размеров хотелось бы добиться"). Отступы вокруг гербов
            увеличены (QA: "отступ увеличить"); оба герба одного
            размера (QA: "приведи этот герб по размеру с предыдущим")
            и выровнены строго по верхней границе — items-start плюс
            сами PNG обрезаны по непрозрачной области (без внутренних
            прозрачных полей вокруг рисунка), поэтому object-contain
            больше не "проседает" вниз с воздухом сверху. Отступ перед
            блоком увеличен (QA: "спустить ниже") — раньше шапка шла
            почти вплотную за тег-лайном. */}
        {/* Отступ шапки от дивайдера (QA изначально просил "все остальные
            блоки подтянуть выше... на величину отступа от верхнего
            дивайдера до верхней границы герба", было mt-[8mm]) — но
            менять его синхронно с отрицательным отступом заголовка
            оказалось ошибкой (см. историю ниже): это двигало ВНИЗ сам
            герб, а не приближало к нему текст, и с каждой попыткой
            рассогласование только росло в другую сторону. Отступ шапки
            и отрицательный сдвиг заголовка теперь настраиваются
            НЕЗАВИСИМО — герб держится на разумном mt-[8mm] (близко к
            исходному), а совпадение по высоте ищем только через
            отступ заголовка ниже. */}
        <div className="mt-[4mm] grid grid-cols-[33mm_1fr_33mm] items-start gap-[7mm]">
          <Emblem
            imageSrc="/emblems/emblem-tank-corps.png"
            label="Танковые войска"
            sublabel="Броня соединяет людей"
            shape="circle"
            sizeMm={33}
          />

          <div className="text-center">
            {/* Верх буквы "Танковый" — по верхнему краю гербов (QA:
                "выровнять верхнюю границу слова «танковый»... по верхней
                границе герба"). Три попытки подряд подобрать отрицательный
                margin-top на глаз (-4мм, затем -8мм, затем -6мм) не дали
                надёжного результата — расстояние "воздуха" шрифта над
                видимой буквой (ascent-запас при leading-[0.8]) не мера в
                мм, а свойство конкретного шрифта, и без рендера его нельзя
                было подобрать точно, только вслепую поймать в вилку.
                Вместо этого — стандартное CSS-свойство text-box-trim
                (Chrome/Edge, начало 2026): оно обрезает у текстового бокса
                именно этот "воздух" сверху по границе капитальной высоты
                шрифта (text-box-edge: cap), а не по мм-приближению. После
                этого верх бокса буквы = верх самой буквы, и items-start у
                сетки уже сам по себе выравнивает его с верхом герба, без
                какого-либо margin-хака. */}
            <h1 className="font-display uppercase tracking-tight">
              <span
                className="cover-h1-trim block text-[90px] font-bold leading-[0.8] text-ink"
                style={{ textBoxTrim: "trim-start", textBoxEdge: "cap alphabetic" } as CSSProperties}
              >
                Танковый
              </span>
              {/* Белый текст на тёмной подложке — как в референсе (QA:
                  "цвет текста белый, подложка и цвет её как в образце").
                  Кегль чуть меньше первой строки и запас паддинга внутри
                  плашки (QA: "чуть меньше размер и чтобы не сливался с
                  границей подложки") — иначе буквы упирались в край
                  оливкового фона. inline-block, а не block на всю
                  ширину, чтобы подложка облегала именно текст. */}
              <span className="mt-[2mm] inline-block bg-olive px-[6mm] py-[2mm] text-[76px] font-bold leading-[0.85] text-paper">
                Батальон
              </span>
            </h1>

            {/* Отступ до "Боевой листок" уменьшен вдвое (QA: "отступ от
                батальон до боевой листок уменьшить ровно наполовину") —
                было mt-[2.5mm]. Подпись ниже автоматически поднимается
                вместе с плашкой в общем потоке, отдельно её отступ не
                трогаем — QA просил только этот один промежуток. */}
            <div className="mx-auto mt-[1.25mm] inline-block -rotate-1 bg-accent px-[5mm] py-[1.5mm]">
              <span className="font-display text-[17px] font-bold uppercase tracking-wide text-paper">
                Боевой листок
              </span>
            </div>

            <p className="mt-[1.5mm] font-body text-[7.5px] uppercase tracking-wide text-olive-dim">
              Внутреннее издание танкового батальона
            </p>
          </div>

          <Emblem
            imageSrc="/emblems/emblem-shavlinsky.png"
            label="Шавлинский полк"
            sublabel="Вместе к новым победам"
            shape="shield"
            sizeMm={33}
          />
        </div>

        {/* №/дата выпуска — по правому краю ВСЕЙ страницы (QA:
            "сориентироваться по правому краю макета"), а не только
            правого края центральной колонки шапки, как было раньше.
            Отступы до сюда и дальше до hero-блока подтянуты (QA:
            "весь блок нужно подтянуть повыше... снизу освободится
            воздуха больше") — раньше между шапкой и фото было заметно
            больше воздуха, чем между остальными блоками страницы. */}
        <div className="mt-[1mm] flex justify-end">
          <IssueMeta number={issue.number} date={issue.date} />
        </div>

        {/* Всё, что ниже плашки "Боевой листок", подтянуто вверх на 10px
            (QA: "подтянуть все что ниже Боевой листок вверх на 10 px") —
            10px = 2.65мм, снят с отступа перед этим дивайдером, дальше
            по потоку сдвигается вместе с ним весь оставшийся контент
            страницы, без изменения отступов друг между другом. */}
        <EditorialRule variant="double" className="mt-[-0.65mm]" />

        <div className="mt-[1mm]">
          <HeroMedia
            photo={heroPhoto ? { src: heroPhoto.src, caption: heroPhoto.caption } : undefined}
            headline={
              heroHeading
                ? { lines: [{ text: heroHeading.text, accent: true }] }
                : undefined
            }
            subtitle={heroSubtitle?.text}
            paragraphs={paragraphs}
            quotes={heroQuotes.map((q) => ({ id: q.id, text: q.text, author: q.author }))}
          />
        </div>

        <EditorialRule className="mt-[1mm]" />

        {/* "В номере" | "Новости" — та же пропорция колонок, что и у
            cover-v1 (см. CoverV1.tsx), применена и здесь. Раньше
            ContentsGrid и NewsBlock шли друг под другом во всю ширину
            страницы: NewsBlock был переработан под узкую колонку в
            отдельном QA-шаге для cover-v1, но здесь по-прежнему рендерился
            на всю ширину и просто добавлял свою высоту к и без того
            высокому ContentsGrid — суммарная высота блока превышала
            бюджет страницы (297мм), и появлялась ошибка переполнения
            (QA: "В боевом листке ошибка"). Поставив блоки РЯДОМ, а не
            друг под другом, высота этой секции равна высоте более
            высокого из двух блоков, а не их сумме — то же решение,
            что уже сработало у cover-v1. */}
        <div className="mt-[1mm] flex flex-1 gap-[3mm]">
          <div className="flex-[2.1]">
            <ContentsGrid issue={issue} />
          </div>
          <div className="flex-1">
            {/* Блок "Новости" — тот же самый компонент, что и у cover-v1
                (Issue.coverNews не привязан к конкретному шаблону обложки).
                Раньше рендерился только в CoverV1 — при переключении
                шаблона страницы 1 на cover-v2 введённые новости "исчезали"
                (тот же класс бага, что уже был с текстовым блоком hero-
                колонки: cover-уровневые поля должны читаться ОБОИМИ
                шаблонами обложки, иначе смена варианта теряет контент). */}
            <NewsBlock rawText={issue.coverNews} />
          </div>
        </div>

        <p className="mt-[1mm] text-right font-body text-[7.5px] italic leading-snug text-olive-dim">
          {CLOSING_LINE}
        </p>

        {/* Дивайдер внизу страницы (QA: "выполни дивайдер снизу каждой
            страницы. Такой же как сверху") — та же двойная линейка,
            что открывает шапку сверху. */}
        <EditorialRule variant="double" className="mt-[2mm]" />
      </div>
    </PageFrame>
  );
}
