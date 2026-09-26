"use client";

import { useEffect, useRef, useState } from "react";

/**
 * PRIORITY 3 — Editor Content Zones / Guides.
 *
 * Архитектура: Layout Template → Content Zones → Production Renderer
 * + Editor Guides. Геометрия зон НЕ рисуется вручную поверх preview —
 * она считывается из реального DOM, который уже построил выбранный
 * шаблон (templateId). Каждый шаблон (components/templates/**) просто
 * помечает свои смысловые контейнеры атрибутом `data-zone="h1|h2|
 * lead|paragraph|photo|caption|quote|achievement"` — этот атрибут
 * ничего не стилизует и ничего не меняет в production-вёрстке, он
 * существует ВСЕГДА (в том числе внутри /api/pdf), просто как метка.
 *
 * Guides — эта отдельная оверлейная сущность — монтируется ТОЛЬКО в
 * редакторе (см. app/issues/[issueId]/page.tsx). /api/pdf и публичный
 * /issues/[id]/preview никогда её не рендерят, поэтому направляющие
 * физически не могут попасть ни в PDF, ни в "чистый" финальный
 * preview, и не могут повлиять на реальную раскладку — сам оверлей
 * `pointer-events-none`, положение вычисляется, а не задаётся.
 *
 * Геометрия каждой зоны — это offsetTop/offsetLeft/offsetWidth/
 * offsetHeight элемента относительно `.kobolt-page` (PageFrame),
 * посчитанные обходом цепочки offsetParent. Это НЕ getBoundingClientRect:
 * offset-геометрия не зависит от CSS `transform: scale()`, которым
 * PagePreviewScaler уменьшает страницу на экране, — поэтому overlay
 * корректно ложится поверх preview на любом масштабе без отдельного
 * пересчёта коэффициента.
 */

/** Экспортируется, чтобы формы редактора (fields.tsx и т.д.) могли
 *  подписывать свои поля ТЕМИ ЖЕ метками зон, что видны на самих
 *  направляющих поверх превью — так оператору сразу понятно, какой
 *  набор полей формы относится к какому блоку страницы (находка QA:
 *  без этого связь "поле формы ↔ визуальный блок" не была очевидна). */
export const ZONE_LABELS: Record<string, string> = {
  h1: "H1",
  h2: "H2",
  lead: "ЛИД",
  paragraph: "ТЕКСТ",
  photo: "ФОТО",
  caption: "ПОДПИСЬ",
  quote: "ЦИТАТА",
  achievement: "ДОСТИЖЕНИЯ",
  news: "НОВОСТИ",
  dayInHistory: "ДЕНЬ В ИСТОРИИ",
  birthdays: "ИМЕНИННИКИ",
};

export const OVERFLOW_MESSAGE =
  "Материала слишком много для выбранного шаблона. Выберите другой шаблон или сократите материал.";

type ZoneRect = {
  key: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  overflow: boolean;
};

/** offset-смещение элемента относительно `root`, независимое от любых
 *  CSS-transform на общих предках (в отличие от getBoundingClientRect). */
function offsetRelativeTo(el: HTMLElement, root: HTMLElement) {
  let top = 0;
  let left = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    top += node.offsetTop;
    left += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return { top, left };
}

export function ContentZoneOverlay({
  containerRef,
  onOverflowChange,
}: {
  /** Ref на обёртку, ВНУТРИ которой рендерится ровно один A4Page
   *  (`.kobolt-page`) — тот же узел, что показывает Preview. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Сообщает наверх (editor page), нужно ли предупредить пользователя
   *  для ИМЕННО ЭТОЙ страницы — используется, например, кнопкой
   *  "Скачать PDF", если понадобится показать точку с overflow. */
  onOverflowChange?: (overflow: boolean) => void;
}) {
  const [zones, setZones] = useState<ZoneRect[]>([]);
  const [pageOverflow, setPageOverflow] = useState(false);
  const lastReported = useRef<boolean | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const root = container!.querySelector<HTMLElement>(".kobolt-page");
      if (!root) return;

      // Страница физически зафиксирована в 210×297mm с overflow-hidden
      // (PageFrame) — визуально лишний контент просто обрезается.
      // scrollHeight у элемента с overflow-hidden ВСЕ РАВНО отражает
      // полную, необрезанную высоту содержимого, поэтому сравнение
      // scrollHeight/clientHeight — надёжный способ обнаружить именно
      // физическое переполнение страницы, а не гадать по объёму текста.
      const overflowed = root.scrollHeight - root.clientHeight > 1;
      setPageOverflow(overflowed);
      if (lastReported.current !== overflowed) {
        lastReported.current = overflowed;
        onOverflowChange?.(overflowed);
      }

      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-zone]"));
      const next: ZoneRect[] = els.map((el, i) => {
        const { top, left } = offsetRelativeTo(el, root);
        const kind = el.dataset.zone ?? "";
        return {
          key: `${kind}-${i}`,
          label: ZONE_LABELS[kind] ?? kind.toUpperCase(),
          top,
          left,
          width: el.offsetWidth,
          height: el.offsetHeight,
          // Зона переполнена, если реальное содержимое внутри неё выше,
          // чем сам зона-контейнер (актуально в первую очередь для зон
          // с физически ограниченной высотой — фото/рамки; у текстовых
          // зон без явной высоты scrollHeight===clientHeight почти
          // всегда, это ожидаемо и не считается сигналом — реальный
          // сигнал даёт page-level overflow banner ниже).
          overflow: el.scrollHeight - el.clientHeight > 1,
        };
      });
      setZones(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    const mo = new MutationObserver(measure);
    mo.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [containerRef, onOverflowChange]);

  return (
    <div className="pointer-events-none absolute inset-0" data-testid="content-zone-overlay">
      {zones.map((z) => (
        <div
          key={z.key}
          data-testid="content-zone"
          data-zone-overflow={z.overflow}
          className={`absolute border border-dashed ${
            z.overflow ? "border-accent" : "border-olive-dim/40"
          }`}
          style={{ top: z.top, left: z.left, width: z.width, height: z.height }}
        >
          <span
            className={`absolute -top-[11px] left-0 whitespace-nowrap font-display text-[7px] font-bold uppercase tracking-wide ${
              z.overflow ? "text-accent" : "text-olive-dim/80"
            }`}
          >
            {z.label}
          </span>
        </div>
      ))}
      {pageOverflow && (
        <div
          data-testid="page-overflow-banner"
          className="absolute inset-x-0 bottom-0 border-t-2 border-accent bg-accent/90 px-[6mm] py-[3mm] text-center font-body text-[8px] font-bold leading-snug text-paper"
        >
          {OVERFLOW_MESSAGE}
        </div>
      )}
    </div>
  );
}
