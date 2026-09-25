 "use client";

import { useEffect, useRef, useState } from "react";

// Конвертация мм → px нужна ТОЛЬКО для арифметики масштабирования на
// экране (сколько раз уменьшить страницу, чтобы она влезла в контейнер).
// Сама страница (PageFrame) остаётся описана в мм и печатью не
// интересуется тем, что здесь происходит визуальное уменьшение.
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4;

/** Вписывает PageFrame (реальные 210×297mm) в доступную ширину
 *  контейнера, сохраняя пропорции — как лист бумаги на столе, а не
 *  "почти A4" произвольного размера. */
export function PagePreviewScaler({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const pageWidthPx = A4_WIDTH_MM * MM_TO_PX;
  const pageHeightPx = A4_HEIGHT_MM * MM_TO_PX;

  useEffect(() => {
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const available = entry.contentRect.width;
      setScale(Math.min(1, available / pageWidthPx));
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [pageWidthPx]);

  return (
    <div ref={outerRef} data-testid="a4-preview" className="w-full">
      <div style={{ width: pageWidthPx * scale, height: pageHeightPx * scale }}>
        <div
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="shadow-[0_2px_24px_rgba(0,0,0,0.25)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
