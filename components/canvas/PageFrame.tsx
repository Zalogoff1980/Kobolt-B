import { ReactNode } from "react";
import { BackgroundEngraving } from "@/components/decorative/BackgroundEngraving";

/**
 * Единственное место, где задан физический размер печатной страницы —
 * 210×297mm, книжная. Всё остальное (Preview-масштабирование,
 * PDF-рендер) работает поверх этого блока, не переопределяя размеры.
 *
 * Почему мм, а не px: `@page { size: A4 }` в print.css и
 * `page.pdf({ format: "A4" })` в Puppeteer (шаг 5) оперируют физическими
 * единицами. Если верстать в px под произвольный desktop-канвас,
 * при печати неизбежно появится рассинхронизация Preview/PDF —
 * это ровно то, чего требовалось избежать корректировкой №2.
 *
 * `backgroundEngravingId` (PRIORITY 6) рендерится ПЕРВЫМ ребёнком —
 * то есть визуально позади `children` — единственная точка входа для
 * фоновой гравюры, общая всем шаблонам (см. BackgroundEngraving.tsx).
 * По умолчанию (undefined/null) ничего не рендерит — вид страницы не
 * меняется для всех уже существующих и новых страниц без выбора.
 */
export function PageFrame({
  children,
  className = "",
  backgroundEngravingId = null,
}: {
  children: ReactNode;
  className?: string;
  backgroundEngravingId?: string | null;
}) {
  return (
    <div
      className={`kobolt-page relative overflow-hidden bg-paper text-ink ${className}`}
      style={{
        width: "210mm",
        height: "297mm",
        // Единые поля страницы — используются всеми шаблонами вместо
        // произвольных чисел, чтобы отступы совпадали по всему изданию.
        ["--page-margin" as any]: "12mm",
      }}
    >
      <BackgroundEngraving id={backgroundEngravingId} />
      {children}
    </div>
  );
}
