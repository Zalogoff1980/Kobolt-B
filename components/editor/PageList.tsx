"use client";

import { Issue } from "@/lib/content/issue";
import { blocksToSections } from "@/lib/content/sections";
import { TEMPLATE_OPTIONS, PAGE_DEFAULT_LABEL } from "@/lib/content/templateOptions";
import { PageThumbnail } from "./PageThumbnail";
import { EditorCard } from "./EditorCard";

const PAGE_NUMBERS = [1, 2, 3, 4] as const;

function pageTitle(issue: Issue, pageNumber: 1 | 2 | 3 | 4): string {
  const levels =
    pageNumber === 1
      ? ({ titleLevel: 2, subtitleLevel: 3 } as const)
      : ({ titleLevel: 1, subtitleLevel: 2 } as const);
  const sections = blocksToSections(issue.pages[pageNumber].content.blocks, levels);
  return sections.title.trim() || PAGE_DEFAULT_LABEL[pageNumber];
}

/** Список страниц выпуска (ТЗ шага 7, п.3). Issue.pages остаётся
 *  единственным источником истины — список не хранит собственного
 *  состояния "какие страницы существуют", он просто читает issue при
 *  каждом рендере. */
export function PageList({
  issue,
  activePage,
  onSelect,
  overflowingPages = [],
}: {
  issue: Issue;
  activePage: 1 | 2 | 3 | 4;
  onSelect: (page: 1 | 2 | 3 | 4) => void;
  /** Номера страниц, где контент физически не помещается в лист
   *  (HiddenOverflowProbe) — у таких страниц в списке значок ⚠, чтобы
   *  оператор видел проблему, не открывая каждую страницу. */
  overflowingPages?: number[];
}) {
  return (
    <EditorCard title="Страницы">
    <ul className="space-y-1.5">
      {PAGE_NUMBERS.map((n) => {
        const page = issue.pages[n];
        const templateLabel =
          TEMPLATE_OPTIONS[n].find((t) => t.id === page.templateId)?.label ??
          (page.templateId ? page.templateId : "шаблон не выбран");
        const isActive = n === activePage;
        const overflows = overflowingPages.includes(n);
        return (
          <li key={n}>
            <button
              onClick={() => onSelect(n)}
              data-testid={`page-item-${n}`}
              data-active={isActive}
              // Выделение активной страницы — раньше border-accent
              // (фирменный красный), QA: "активные зоны... выделение
              // красным заменить" — тот же спокойный "zone-alert", что
              // и в ContentZoneOverlay, а не оставшийся кое-где красный.
              className={`flex w-full items-center gap-3 rounded-control border px-2 py-2 text-left ${
                isActive ? "border-zone-alert bg-zone-alert/5" : "border-ink/10 hover:border-ink/30 hover:bg-chrome/40"
              }`}
            >
              <PageThumbnail issue={issue} pageNumber={n} />
              <div className="min-w-0 flex-1">
                <p
                  data-testid={`page-title-${n}`}
                  className="font-display text-xs font-bold uppercase tracking-wide text-ink"
                >
                  {String(n).padStart(2, "0")} — {pageTitle(issue, n)}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-olive-dim">{templateLabel}</p>
                {overflows && (
                  <p
                    data-testid={`page-overflow-${n}`}
                    className="mt-0.5 text-[11px] font-bold text-zone-alert"
                  >
                    ⚠ Не помещается на странице
                  </p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
    </EditorCard>
  );
}
