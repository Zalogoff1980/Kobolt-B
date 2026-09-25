"use client";

import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { qaPage3ThemePhoto, qaPage3ThemeTextPhotos } from "@/lib/content/qaFixturesPage3";

/** QA: страница 3 (тематический материал) — Template A и Template B
 *  на трёх объёмах контента. Не пользовательский экран. */
export default function Page3QaPage() {
  const rows = [
    { label: "Мало контента", a: qaPage3ThemePhoto.low, b: qaPage3ThemeTextPhotos.low },
    { label: "Нормальный объём", a: qaPage3ThemePhoto.normal, b: qaPage3ThemeTextPhotos.normal },
    { label: "Большой объём", a: qaPage3ThemePhoto.high, b: qaPage3ThemeTextPhotos.high },
  ];

  return (
    <main className="min-h-screen bg-stage p-8">
      <div className="mx-auto max-w-6xl space-y-14">
        <p className="text-xs uppercase tracking-wide text-paper/60">
          QA: страница 3 — Template A (theme-photo-v1) и Template B
          (theme-text-photos-v1) на трёх объёмах контента — не пользовательский экран
        </p>

        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 font-display text-sm font-bold uppercase text-paper">{row.label}</p>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template A</p>
                <PagePreviewScaler>
                  <A4Page issue={row.a} pageNumber={3} />
                </PagePreviewScaler>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template B</p>
                <PagePreviewScaler>
                  <A4Page issue={row.b} pageNumber={3} />
                </PagePreviewScaler>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
