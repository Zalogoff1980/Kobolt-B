"use client";

import { useRef, useState } from "react";

const PAGES = [1, 2, 3, 4] as const;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Полоса под превью страницы — смахивание влево/вправо переключает
 * страницу выпуска, без необходимости тянуться к кнопкам номеров
 * страниц вверху (QA: "смахивание страниц... чтобы прям внизу можно
 * было свайпом листать, а не по номерам нажимать"). Точки — текущая
 * позиция и запасной способ ткнуть в конкретную страницу пальцем/мышью;
 * стрелки — то же самое для тех, кто вообще не свайпает.
 *
 * touch-pan-y на обёртке — жест здесь ловит именно ГОРИЗОНТАЛЬНОЕ
 * движение сам (через onTouchMove/onTouchEnd), а браузерный вертикальный
 * скролл страницы редактора (overflow-y-auto у колонки превью) при этом
 * не блокируется.
 */
export function PreviewPager({
  activePage,
  onSelectPage,
}: {
  activePage: 1 | 2 | 3 | 4;
  onSelectPage: (page: 1 | 2 | 3 | 4) => void;
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  function go(delta: 1 | -1) {
    const next = activePage + delta;
    if (next >= 1 && next <= 4) onSelectPage(next as 1 | 2 | 3 | 4);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    startX.current = t.clientX;
    startY.current = t.clientY;
    dragging.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t || startX.current === null || startY.current === null) return;
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;
    // Жест считается горизонтальным свайпом, только если движение по X
    // заметно больше, чем по Y — иначе обычная вертикальная прокрутка
    // пальцем по узкой полосе ошибочно считалась бы попыткой перелистнуть.
    if (!dragging.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      dragging.current = true;
    }
    if (dragging.current) e.preventDefault();
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    if (dragging.current && t && startX.current !== null) {
      const dx = t.clientX - startX.current;
      if (dx <= -SWIPE_THRESHOLD_PX) go(1);
      else if (dx >= SWIPE_THRESHOLD_PX) go(-1);
    }
    startX.current = null;
    startY.current = null;
    dragging.current = false;
  }

  return (
    <div
      data-testid="preview-swipe-pager"
      className="mt-3 select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        Смахните здесь, чтобы перелистнуть страницу
      </p>
    </div>
  );
}
