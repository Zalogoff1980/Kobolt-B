import { EngravingTank } from "@/components/decorative/EngravingTank";

/**
 * Заголовочный блок внутренней статьи: H1 + необязательный H2/H3.
 * Общий для Template A и Template B — у страницы "История" не должно
 * быть двух разных манер подачи заголовка в зависимости от того, как
 * разложены фотографии.
 */
export function ArticleTitle({
  title,
  subtitle,
  showIcon = true,
}: {
  title?: string;
  subtitle?: string;
  /** Декоративная гравюра-иконка справа от заголовка рассчитана на
   *  заголовок во всю ширину страницы. Когда ArticleTitle встроен в
   *  узкую текстовую колонку рядом с фото (см. compact-раскладки ниже,
   *  QA: "заголовок начинается хрен пойми как относительно верхнего
   *  края изображения" — заголовок и фото должны стартовать вровень,
   *  как в утверждённом макете обложки), иконка там лишняя и тесная —
   *  отключается через showIcon={false}. */
  showIcon?: boolean;
}) {
  const heading = (
    <div>
      {title && (
        // Межстрочный интервал и отступ до h2 приведены к образцу
        // страницы 1 (QA: "образец 1 стр" — hero-заголовок обложки,
        // components/templates/cover/HeroMedia.tsx, leading-snug вместо
        // leading-[1.6]: "стандартное правило 1.6×кегль рассчитано на
        // связный текст абзаца, а не на короткий многострочный
        // заголовок-акцент"). Тот же принцип — единый для всех
        // заголовков h1/h2, а не только для обложки.
        <h1
          data-zone="h1"
          className="font-display text-[33px] font-bold uppercase leading-snug tracking-tight text-ink"
        >
          {title}
        </h1>
      )}
      {subtitle && (
        <h2
          data-zone="h2"
          className="mt-[2mm] font-display text-[23px] font-bold uppercase leading-snug tracking-wide text-olive"
        >
          {subtitle}
        </h2>
      )}
    </div>
  );

  if (!showIcon) return heading;

  return (
    <div className="flex items-start justify-between gap-[6mm]">
      {heading}
      <EngravingTank className="mt-[1mm] block w-[32mm] flex-shrink-0 text-olive/25" />
    </div>
  );
}
