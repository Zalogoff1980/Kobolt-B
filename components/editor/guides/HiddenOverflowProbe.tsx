"use client";

import { useEffect, useRef } from "react";
import { Issue } from "@/lib/content/issue";
import { A4Page } from "@/components/canvas/A4Page";

/**
 * Проверка "физически помещается ли контент" для ВСЕХ 4 страниц разом —
 * используется кнопкой "Скачать PDF" (PRIORITY 1, п.12: если контент не
 * помещается, показать политику overflow вместо тихой обрезки в PDF).
 *
 * Рендерит те же 4 `<A4Page>` в реальном (не масштабированном!) DOM,
 * но визуально за пределами экрана — тот же принцип, что и
 * ContentZoneOverlay: измеряем реальный браузерный layout, а не
 * оцениваем на глаз. Каждая страница физически 210×297mm с
 * overflow-hidden (PageFrame) — scrollHeight > clientHeight значит
 * контент выше, чем помещается в лист.
 */
export function HiddenOverflowProbe({
  issue,
  onResult,
}: {
  issue: Issue;
  onResult: (overflowingPages: number[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pageNumbers = Object.keys(issue.pages)
    .map(Number)
    .sort((a, b) => a - b);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    function measure() {
      const roots = Array.from(container!.querySelectorAll<HTMLElement>(".kobolt-page"));
      const overflowing: number[] = [];
      // Индекс DOM-узла больше не равен номеру страницы, когда страниц
      // может быть больше 4 (QA: "возможность добавить новую
      // страницу... без жёсткого лимита") — сопоставляем результат
      // измерения с фактическим списком номеров страниц по порядку.
      roots.forEach((root, i) => {
        const n = pageNumbers[i];
        if (n === undefined) return;
        if (root.scrollHeight - root.clientHeight > 1) overflowing.push(n);
      });
      onResult(overflowing);
    }

    // Один лишний кадр даёт шрифтам/картинкам, уже присутствующим в DOM,
    // осесть перед измерением; ResizeObserver дальше держит результат
    // актуальным при живом редактировании.
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="hidden-overflow-probe"
      className="pointer-events-none fixed left-[-99999px] top-0 opacity-0"
    >
      {pageNumbers.map((n) => (
        <A4Page key={n} issue={issue} pageNumber={n} />
      ))}
    </div>
  );
}
