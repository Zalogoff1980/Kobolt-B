"use client";

import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { qaPage2ArticlePhoto, qaPage2PhotoGrid } from "@/lib/content/qaFixturesPage2";

/** Внутренняя QA-страница: Template A и Template B страницы "История"
 *  на трёх объёмах контента (низкий / нормальный / высокий). Не часть
 *  пользовательского сценария — держим для визуальной регрессии. */
export default function Page2QaPage() {
  const rows: Array<{ label: string; a: any; b: any }> = [
    { label: "Мало текста", a: qaPage2ArticlePhoto.low, b: qaPage2PhotoGrid.low },
    { label: "Нормальный объём", a: qaPage2ArticlePhoto.normal, b: qaPage2PhotoGrid.normal },
    { label: "Большой объём", a: qaPage2ArticlePhoto.high, b: qaPage2PhotoGrid.high },
  ];

  return (
    <main className="min-h-screen bg-[#4a4a42] p-8">
      <div className="mx-auto max-w-6xl space-y-14">
        <p className="text-xs uppercase tracking-wide text-paper/60">
          QA: страница 2 "История" — Template A (article-photo-v1) и Template B
          (photo-grid-v1) на трёх объёмах контента — не пользовательский экран
        </p>

        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 font-display text-sm font-bold uppercase text-paper">{row.label}</p>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template A</p>
                <PagePreviewScaler>
                  <A4Page issue={row.a} pageNumber={2} />
                </PagePreviewScaler>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template B</p>
                <PagePreviewScaler>
                  <A4Page issue={row.b} pageNumber={2} />
                </PagePreviewScaler>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
