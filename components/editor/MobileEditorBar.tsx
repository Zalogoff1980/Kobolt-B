"use client";

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
 * На десктопе (lg и шире) панель не показывается — там форма и
 * страница и так рядом.
 */
export function MobileEditorBar({
  activePage,
  onSelectPage,
  overflowingPages,
  inView,
  onJump,
}: {
  activePage: 1 | 2 | 3 | 4;
  onSelectPage: (page: 1 | 2 | 3 | 4) => void;
  overflowingPages: number[];
  /** Какая часть экрана сейчас в основном на виду. */
  inView: "form" | "page";
  onJump: (target: "form" | "page") => void;
}) {
  return (
    <div
      data-testid="mobile-editor-bar"
      className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-ink/15 bg-chrome px-3 py-2 lg:hidden"
    >
      <div className="flex gap-1" role="tablist" aria-label="Страницы выпуска">
        {([1, 2, 3, 4] as const).map((n) => {
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
              className={`relative min-h-[40px] min-w-[40px] appearance-none rounded-hairline border px-2 font-display text-sm font-bold ${
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
      </div>

      <div className="flex overflow-hidden rounded-hairline border border-ink/20 text-xs">
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
  );
}
