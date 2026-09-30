"use client";

import { templateOptionsFor } from "@/lib/content/templateOptions";
import { CardButton } from "./EditorCard";

/**
 * Липкая панель редактора для телефона (< lg). На узком экране форма
 * стоит над страницей, и после правки поля страницу приходится долго
 * искать прокруткой; панель всегда под рукой:
 *
 *   [ 1 ] [ 2 ⚠ ] [ 3 ] [ 4 ]        [ Форма | Страница ]
 *
 * Номера — переключение страницы (⚠ у страниц, где контент не
 * помещается), "Форма / Страница" — быстрый переход прокруткой к
 * началу формы или к самой странице; подсвечена та часть, что сейчас
 * на экране. Ничего не скрывает (форма и превью остаются в DOM и
 * видимы), поэтому раскладка и тесты на широкой раскладке не меняются.
 *
 * Когда на экране страница (а карточка «Шаблон страницы» из формы
 * уже прокручена вверх), под панелью «залипает» узкая строка выбора
 * шаблона — его можно менять, не пролистывая обратно к форме. Пока
 * оператор наверху и видит саму карточку, строка не показывается и
 * поведение прежнее.
 *
 * На десктопе (lg и шире) панель не показывается — там форма и
 * страница и так рядом.
 */
export function MobileEditorBar({
  pages,
  activePage,
  onSelectPage,
  onAddPage,
  overflowingPages,
  inView,
  onJump,
  currentTemplateId,
  onTemplateChange,
}: {
  /** Номера страниц выпуска, в порядке отображения — берутся из
   *  фактических ключей issue.pages (QA: "возможность добавить новую
   *  страницу... без жёсткого лимита"), а не фиксированы на [1,2,3,4]. */
  pages: number[];
  activePage: number;
  onSelectPage: (page: number) => void;
  /** Добавить страницу в конец выпуска — рисует "+" вкладку в конце
   *  ряда номеров. Если не передан, вкладка не рендерится. */
  onAddPage?: () => void;
  overflowingPages: number[];
  /** Какая часть экрана сейчас в основном на виду. */
  inView: "form" | "page";
  onJump: (target: "form" | "page") => void;
  currentTemplateId: string | null;
  onTemplateChange: (templateId: string) => void;
}) {
  const templateOptions = templateOptionsFor(activePage);
  const showTemplates = inView === "page" && templateOptions.length > 1;
  return (
    <div
      data-testid="mobile-editor-bar"
      className="sticky top-0 z-20 border-b border-ink/15 bg-chrome lg:hidden"
    >
     <div className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex gap-1" role="tablist" aria-label="Страницы выпуска">
        {pages.map((n) => {
          const isActive = n === activePage;
          const overflows = overflowingPages.includes(n);
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`mobile-page-tab-${n}`}
              onClick={() => onSelectPage(n)}
              className={`relative min-h-[40px] min-w-[40px] appearance-none rounded-control border px-2 font-display text-sm font-bold ${
                isActive
                  ? "border-zone-alert bg-zone-alert/10 text-ink"
                  : "border-ink/20 text-olive-dim"
              }`}
            >
              {n}
              {overflows && (
                <span
                  aria-label="не помещается на странице"
                  className="absolute -right-1 -top-1 text-[11px] leading-none text-zone-alert"
                >
                  ⚠
                </span>
              )}
            </button>
          );
        })}
        {onAddPage && (
          <button
            type="button"
            data-testid="mobile-page-tab-add"
            onClick={onAddPage}
            aria-label="Добавить страницу"
            className="flex min-h-[40px] min-w-[40px] appearance-none items-center justify-center rounded-control border border-dashed border-ink/25 font-display text-sm font-bold text-olive-dim"
          >
            +
          </button>
        )}
      </div>

      <div className="flex overflow-hidden rounded-control border border-ink/20 text-xs">
        {(
          [
            ["form", "Форма"],
            ["page", "Страница"],
          ] as const
        ).map(([target, label]) => (
          <button
            key={target}
            type="button"
            data-testid={`mobile-jump-${target}`}
            aria-pressed={inView === target}
            onClick={() => onJump(target)}
            className={`min-h-[40px] appearance-none px-3 font-bold ${
              inView === target ? "bg-ink text-paper" : "bg-transparent text-olive-dim"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
     </div>

      {showTemplates && (
        <div
          data-testid="mobile-template-row"
          className="flex items-center gap-2 border-t border-ink/10 px-3 py-1.5"
        >
          <span className="flex-shrink-0 font-body text-xs font-semibold text-olive">Шаблон</span>
          {templateOptions.map((opt) => (
            <CardButton
              key={opt.id}
              onClick={() => onTemplateChange(opt.id)}
              data-testid={`mobile-template-option-${opt.id}`}
              selected={currentTemplateId === opt.id}
              className="flex-1"
            >
              {opt.label}
            </CardButton>
          ))}
        </div>
      )}

      {/* Затухающий край под панелью: контент уходит под неё плавно, а не
          обрезается по линии — видно, что редактор прокручен вверх. */}
      <div
        aria-hidden
        data-testid="mobile-bar-fade"
        className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-chrome/90 to-transparent"
      />
    </div>
  );
}
