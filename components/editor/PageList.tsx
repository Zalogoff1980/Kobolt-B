"use client";

import { Issue } from "@/lib/content/issue";
import { blocksToSections } from "@/lib/content/sections";
import { templateOptionsFor, pageDefaultLabel } from "@/lib/content/templateOptions";
import { PageThumbnail } from "./PageThumbnail";
import { EditorCard } from "./EditorCard";

function pageTitle(issue: Issue, pageNumber: number): string {
  const levels =
    pageNumber === 1
      ? ({ titleLevel: 2, subtitleLevel: 3 } as const)
      : ({ titleLevel: 1, subtitleLevel: 2 } as const);
  const sections = blocksToSections(issue.pages[pageNumber]!.content.blocks, levels);
  return sections.title.trim() || pageDefaultLabel(pageNumber);
}

/** Список страниц выпуска (ТЗ шага 7, п.3). Issue.pages остаётся
 *  единственным источником истины — список не хранит собственного
 *  состояния "какие страницы существуют", он просто читает issue при
 *  каждом рендере. Номера страниц берутся из фактических ключей
 *  issue.pages (а не из жёстко зашитого [1,2,3,4]), отсортированных по
 *  возрастанию — так список автоматически подхватывает добавленные
 *  оператором страницы сверх базовых 4 (QA: "возможность добавить
 *  новую страницу... без жёсткого лимита"). */
export function PageList({
  issue,
  activePage,
  onSelect,
  onAddPage,
  onDeletePage,
  overflowingPages = [],
}: {
  issue: Issue;
  activePage: number;
  onSelect: (page: number) => void;
  /** Добавить новую страницу в конец выпуска — рисует карточку с "+"
   *  в конце списка (QA: "пустая превью страницы со знаком + в
   *  кружочке"). Если не передан, карточка добавления не рендерится. */
  onAddPage?: () => void;
  /** Удалить страницу (кнопка у каждой страницы, кроме обложки —
   *  обложка в выпуске обязательна). Подтверждение и перенумерацию
   *  делает вызывающий код. Если не передан, кнопки удаления нет. */
  onDeletePage?: (page: number) => void;
  /** Номера страниц, где контент физически не помещается в лист
   *  (HiddenOverflowProbe) — у таких страниц в списке значок ⚠, чтобы
   *  оператор видел проблему, не открывая каждую страницу. */
  overflowingPages?: number[];
}) {
  const pageNumbers = Object.keys(issue.pages)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <EditorCard title="Страницы">
    <ul className="space-y-1.5">
      {pageNumbers.map((n) => {
        const page = issue.pages[n]!;
        const templateLabel =
          templateOptionsFor(n, page.templateId).find((t) => t.id === page.templateId)?.label ??
          (page.templateId ? page.templateId : "шаблон не выбран");
        const isActive = n === activePage;
        const overflows = overflowingPages.includes(n);
        return (
          <li key={n} className="flex items-stretch gap-1.5">
            <button
              onClick={() => onSelect(n)}
              data-testid={`page-item-${n}`}
              data-active={isActive}
              // Выделение активной страницы — раньше border-accent
              // (фирменный красный), QA: "активные зоны... выделение
              // красным заменить" — тот же спокойный "zone-alert", что
              // и в ContentZoneOverlay, а не оставшийся кое-где красный.
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-control border px-2 py-2 text-left ${
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
            {/* Отдельная кнопка рядом (а не внутри карточки страницы —
                кнопка в кнопке недопустима). Обложку удалить нельзя. */}
            {onDeletePage && n !== 1 && (
              <button
                type="button"
                onClick={() => onDeletePage(n)}
                data-testid={`page-delete-${n}`}
                aria-label={`Удалить страницу ${n}`}
                title="Удалить страницу"
                className="flex min-w-[44px] flex-shrink-0 items-center justify-center rounded-control border border-ink/10 text-base text-olive-dim hover:border-zone-alert hover:bg-zone-alert/5 hover:text-zone-alert"
              >
                🗑
              </button>
            )}
          </li>
        );
      })}
      {onAddPage && (
        <li>
          <button
            onClick={onAddPage}
            data-testid="page-item-add"
            className="flex w-full items-center gap-3 rounded-control border border-dashed border-ink/25 px-2 py-2 text-left hover:border-ink/40 hover:bg-chrome/40"
          >
            {/* Пустая превью-миниатюра со знаком "+" в кружочке — тот
                же размер, что у PageThumbnail выше, чтобы карточка
                добавления не выбивалась из ряда (QA: "пустая превью
                страницы со знаком + в кружочке"). */}
            <div
              style={{ width: 64, height: (297 / 210) * 64 }}
              className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-card border border-dashed border-ink/25 bg-chrome/30"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/40 text-sm leading-none text-olive-dim">
                +
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-olive-dim">
                Добавить страницу
              </p>
            </div>
          </button>
        </li>
      )}
    </ul>
    </EditorCard>
  );
}
