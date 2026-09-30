"use client";

import { Issue } from "@/lib/content/issue";
import { A4Page } from "@/components/canvas/A4Page";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4;

/** Маленькая миниатюра A4 для списка страниц редактора — тот же
 *  A4Page, просто уменьшенный через transform:scale (как
 *  PagePreviewScaler, но с фиксированной целевой шириной вместо
 *  измерения контейнера — миниатюре не нужен ResizeObserver). */
export function PageThumbnail({
  issue,
  pageNumber,
  widthPx = 64,
}: {
  issue: Issue;
  pageNumber: number;
  widthPx?: number;
}) {
  const pageWidthPx = A4_WIDTH_MM * MM_TO_PX;
  const pageHeightPx = A4_HEIGHT_MM * MM_TO_PX;
  const scale = widthPx / pageWidthPx;
  const heightPx = pageHeightPx * scale;

  return (
    <div
      style={{ width: widthPx, height: heightPx }}
      className="flex-shrink-0 overflow-hidden rounded-card border border-ink/15 bg-paper"
    >
      <div
        style={{
          width: pageWidthPx,
          height: pageHeightPx,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <A4Page issue={issue} pageNumber={pageNumber} />
      </div>
    </div>
  );
}
