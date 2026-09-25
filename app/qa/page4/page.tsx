"use client";

import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { qaPage4PersonFeature, qaPage4TeamFaces } from "@/lib/content/qaFixturesPage4";

/** QA: страница 4 "Лица батальона" — Template A (person-feature-v1) и
 *  Template B (team-faces-v1) на трёх объёмах контента, плюс отдельная
 *  проверка поведения без фотографий. Не пользовательский экран. */
export default function Page4QaPage() {
  const rows = [
    { label: "Мало контента", a: qaPage4PersonFeature.low, b: qaPage4TeamFaces.low },
    { label: "Нормальный объём", a: qaPage4PersonFeature.normal, b: qaPage4TeamFaces.normal },
    { label: "Большой объём", a: qaPage4PersonFeature.high, b: qaPage4TeamFaces.high },
  ];

  return (
    <main className="min-h-screen bg-stage p-8">
      <div className="mx-auto max-w-6xl space-y-14">
        <p className="text-xs uppercase tracking-wide text-paper/60">
          QA: страница 4 "Лица батальона" — Template A (person-feature-v1) и
          Template B (team-faces-v1) — не пользовательский экран
        </p>

        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 font-display text-sm font-bold uppercase text-paper">{row.label}</p>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template A — Лицо</p>
                <PagePreviewScaler>
                  <A4Page issue={row.a} pageNumber={4} />
                </PagePreviewScaler>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-paper/60">Template B — Команда</p>
                <PagePreviewScaler>
                  <A4Page issue={row.b} pageNumber={4} />
                </PagePreviewScaler>
              </div>
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase text-paper">
            Доп. проверка: фото ещё не выбраны
          </p>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase text-paper/60">Template A — без фото</p>
              <PagePreviewScaler>
                <A4Page issue={qaPage4PersonFeature.noPhoto} pageNumber={4} />
              </PagePreviewScaler>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-paper/60">Template B — без фото</p>
              <PagePreviewScaler>
                <A4Page issue={qaPage4TeamFaces.noPhotos} pageNumber={4} />
              </PagePreviewScaler>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
