import { ReactNode } from "react";
import { PageFrame } from "@/components/canvas/PageFrame";
import { InnerHeader } from "./InnerHeader";

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
        {/* Отступ от шапки уплотнён (по опыту обложки: "плотность как
            на обложке" — заголовок должен начинаться на одной и той же,
            более собранной высоте от верха на всех внутренних страницах,
            а не висеть в воздухе). Было 5мм. */}
        <div className="mt-[4mm] flex-1">{children}</div>
      </div>
    </PageFrame>
  );
}
