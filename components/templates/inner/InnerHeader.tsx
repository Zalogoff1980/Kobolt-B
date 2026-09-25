import { formatIssueDate } from "@/lib/content/format";
import { EditorialRule } from "@/components/shared/EditorialRule";

const DEFAULT_TAGLINE = "СИЛА · В ДВИЖЕНИИ · ЧЕСТЬ · БРАТСТВО · ПОБЕДА";

/**
 * Постоянная шапка внутренних страниц (ТЗ п.9): номер страницы + имя
 * издания слева, номер выпуска и дата справа — формируются автоматически
 * из Issue. Общая для всех внутренних шаблонов (страницы 2–4), поэтому
 * живёт отдельно, а не дублируется внутри Template A / Template B.
 */
export function InnerHeader({
  pageNumber,
  issueNumber,
  issueDate,
}: {
  pageNumber: number;
  issueNumber: string;
  issueDate: string;
}) {
  return (
    <header>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-[2mm] font-display text-[8px] font-bold uppercase tracking-wide">
          <span className="text-accent">{String(pageNumber).padStart(2, "0")}</span>
          <span>Танковый батальон | Боевой листок</span>
        </div>

        <div className="flex items-baseline gap-[4mm] font-display text-[8px] font-bold uppercase tracking-wide text-olive-dim">
          <span>
            № {issueNumber} | {formatIssueDate(issueDate)}
          </span>
          <span className="text-[7px] tracking-[0.1em]">{DEFAULT_TAGLINE}</span>
        </div>
      </div>
      <EditorialRule variant="double" className="mt-[2mm]" />
    </header>
  );
}
