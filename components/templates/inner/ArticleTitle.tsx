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
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-[6mm]">
      <div>
        {title && (
          <h1 className="font-display text-[28px] font-bold uppercase leading-[0.92] tracking-tight text-ink">
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 className="mt-[1.5mm] font-display text-[12px] font-bold uppercase tracking-wide text-olive">
            {subtitle}
          </h2>
        )}
      </div>
      <EngravingTank className="mt-[1mm] block w-[32mm] flex-shrink-0 text-olive/25" />
    </div>
  );
}
