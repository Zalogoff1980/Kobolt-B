"use client";

import { Issue } from "@/lib/content/issue";
import { blocksToSections } from "@/lib/content/sections";
import { TEMPLATE_OPTIONS, PAGE_DEFAULT_LABEL } from "@/lib/content/templateOptions";
import { PageThumbnail } from "./PageThumbnail";

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
}: {
  issue: Issue;
  activePage: 1 | 2 | 3 | 4;
  onSelect: (page: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <ul className="space-y-1">
      {PAGE_NUMBERS.map((n) => {
        const page = issue.pages[n];
        const templateLabel =
          TEMPLATE_OPTIONS[n].find((t) => t.id === page.templateId)?.label ??
          (page.templateId ? page.templateId : "шаблон не выбран");
        const isActive = n === activePage;
        return (
          <li key={n}>
            <button
              onClick={() => onSelect(n)}
              data-testid={`page-item-${n}`}
              data-active={isActive}
              className={`flex w-full items-center gap-3 border px-2 py-2 text-left ${
                isActive ? "border-accent bg-accent/5" : "border-transparent hover:border-ink/15"
              }`}
            >
              <PageThumbnail issue={issue} pageNumber={n} />
              <div className="min-w-0">
                <p
                  data-testid={`page-item-title-${n}`}
                  className="font-display text-xs font-bold uppercase tracking-wide text-ink"
                >
                  {String(n).padStart(2, "0")} — {pageTitle(issue, n)}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-olive-dim">{templateLabel}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
