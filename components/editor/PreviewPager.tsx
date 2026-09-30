"use client";

const PAGES = [1, 2, 3, 4] as const;

/**
 * Точки-индикаторы + стрелки под превью страницы. Сам жест смахивания
 * теперь ловится на ВСЁМ окне превью (см. page.tsx — QA: "свайп не
 * снизу странички, а в целом в окне, неудобно снизу"), эта полоса —
 * только видимый индикатор текущей страницы и запасной способ ткнуть
 * в конкретную страницу пальцем/мышью, без какой-либо жестовой логики
 * в себе самой.
 */
export function PreviewPager({
  activePage,
  onSelectPage,
}: {
  activePage: 1 | 2 | 3 | 4;
  onSelectPage: (page: 1 | 2 | 3 | 4) => void;
}) {
  function go(delta: 1 | -1) {
    const next = activePage + delta;
    if (next >= 1 && next <= 4) onSelectPage(next as 1 | 2 | 3 | 4);
  }

  return (
    <div data-testid="preview-swipe-pager" className="mt-3 select-none">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Предыдущая страница"
          data-testid="preview-pager-prev"
          onClick={() => go(-1)}
          disabled={activePage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/25 text-lg text-paper/80 disabled:opacity-30"
        >
          ‹
        </button>

        <div className="flex gap-2.5" role="tablist" aria-label="Страницы выпуска">
          {PAGES.map((n) => (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={n === activePage}
              aria-label={`Страница ${n}`}
              data-testid={`preview-pager-dot-${n}`}
              onClick={() => onSelectPage(n)}
              className={`h-3 w-3 rounded-full border border-paper/40 transition-colors ${
                n === activePage ? "bg-paper" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Следующая страница"
          data-testid="preview-pager-next"
          onClick={() => go(1)}
          disabled={activePage === 4}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/25 text-lg text-paper/80 disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <p className="mt-1 text-center font-body text-[11px] text-paper/45">
        Смахните в любом месте превью, чтобы перелистнуть страницу
      </p>
    </div>
  );
}
