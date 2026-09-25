import { formatIssueDate } from "@/lib/content/format";

/** Номер выпуска и дата — постоянные элементы, данные приходят из
 *  Issue автоматически (ТЗ п.3), компонент сам ничего не придумывает. */
export function IssueMeta({ number, date }: { number: string; date: string }) {
  return (
    <div className="flex items-center gap-[3mm]">
      <div className="flex items-baseline gap-[1mm] bg-accent px-[2.5mm] py-[1mm] text-paper">
        <span className="font-display text-[9px] font-bold">№</span>
        <span className="font-display text-[14px] font-bold leading-none">{number}</span>
      </div>
      <div className="font-display text-[9px] font-bold uppercase tracking-wide text-ink">
        {formatIssueDate(date)}
      </div>
    </div>
  );
}
