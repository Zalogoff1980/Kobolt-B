"use client";

/**
 * Точки-индикаторы + стрелки под превью страницы. Сам жест смахивания
 * теперь ловится на ВСЁМ окне превью (см. page.tsx — QA: "свайп не
 * снизу странички, а в целом в окне, неудобно снизу"), эта полоса —
 * только видимый индикатор текущей страницы и запасной способ ткнуть
 * в конкретную страницу пальцем/мышью, без какой-либо жестовой логики
 * в себе самой.
 *
 * Список страниц передаётся снаружи (а не зашит как [1,2,3,4]) — выпуск
 * может содержать добавленные оператором страницы сверх базовых 4 (QA:
 * "возможность добавить новую страницу... без жёсткого лимита").
 */
export function PreviewPager({
  pages,
  activePage,
  onSelectPage,
}: {
  pages: number[];
  activePage: number;
  onSelectPage: (page: number) => void;
}) {
  const index = pages.indexOf(activePage);
  const isFirst = index <= 0;
  const isLast = index === -1 || index === pages.length - 1;

  function go(delta: 1 | -1) {
    const next = index + delta;
    if (next >= 0 && next < pages.length) onSelectPage(pages[next]!);
  }

  return (
    <div data-testid="preview-swipe-pager" className="mt-3 select-none">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Предыдущая страница"
          data-testid="preview-pager-prev"
          onClick={() => go(-1)}
          disabled={isFirst}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/25 text-lg text-paper/80 disabled:opacity-30"
        >
          ‹
        </button>

        <div className="flex gap-2.5" role="tablist" aria-label="Страницы выпуска">
          {pages.map((n) => (
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
          disabled={isLast}
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
