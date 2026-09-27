import { ReactNode } from "react";
import { PageFrame } from "@/components/canvas/PageFrame";
import { InnerHeader } from "./InnerHeader";
import { EditorialRule } from "@/components/shared/EditorialRule";

/**
 * Общая оболочка внутренней страницы: PageFrame + постоянная шапка +
 * единые поля. И Template A, и Template B страницы "История" (и
 * будущие шаблоны страниц 3–4) собираются поверх неё — так поля,
 * шапка и типографическая база гарантированно совпадают у всех
 * внутренних страниц издания.
 */
export function InnerPageShell({
  pageNumber,
  issueNumber,
  issueDate,
  backgroundEngravingId = null,
  children,
}: {
  pageNumber: number;
  issueNumber: string;
  issueDate: string;
  backgroundEngravingId?: string | null;
  children: ReactNode;
}) {
  return (
    <PageFrame backgroundEngravingId={backgroundEngravingId}>
      <div className="relative flex h-full flex-col px-[var(--page-margin)] py-[10mm]">
        <InnerHeader pageNumber={pageNumber} issueNumber={issueNumber} issueDate={issueDate} />
        {/* Отступ от шапки (QA, скриншот внутренней страницы: "текстовый
            блок и изображение слишком близко к дивайдеру. Мало воздуха")
            — 4мм после двойной линейки шапки оказалось слишком плотно на
            практике, несмотря на более раннее уплотнение "по опыту
            обложки" (было 5мм → 4мм). Увеличено до 8мм — заголовок и фото
            всё ещё стоят заметно выше на странице, чем на обложке (там
            своя, более высокая шапка), так что плотность здесь не должна
            быть один в один такой же. */}
        <div className="mt-[8mm] flex-1">{children}</div>
        {/* Дивайдер внизу страницы (QA: "выполни дивайдер снизу каждой
            страницы. Такой же как сверху") — та же двойная линейка,
            что закрывает шапку сверху (InnerHeader), теперь закрывает
            страницу и снизу. */}
        <EditorialRule variant="double" className="mt-[4mm]" />
      </div>
    </PageFrame>
  );
}
