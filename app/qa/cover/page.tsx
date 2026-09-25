"use client";

import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { PageFrame } from "@/components/canvas/PageFrame";
import { ContentsBlock } from "@/components/templates/cover/ContentsBlock";
import { qaIssueStateA, qaIssueStateB, qaContentsVariants } from "@/lib/content/qaFixtures";

/**
 * Внутренняя QA-страница: не часть пользовательского сценария,
 * не связывается из навигации. Проверка адаптивности cover-v1 на
 * двух состояниях наполнения — держим её в репозитории, чтобы
 * регрессию можно было проверить визуально при любой правке шаблона.
 */
export default function CoverQaPage() {
  return (
    <main className="min-h-screen bg-stage p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <p className="text-xs uppercase tracking-wide text-paper/60">
          QA: cover-v1 на разных объёмах контента — не пользовательский экран
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-2 font-display text-sm font-bold uppercase text-paper">
              Состояние A — мало контента
            </p>
            <PagePreviewScaler>
              <A4Page issue={qaIssueStateA} pageNumber={1} />
            </PagePreviewScaler>
          </div>
          <div>
            <p className="mb-2 font-display text-sm font-bold uppercase text-paper">
              Состояние B — нормальное заполнение
            </p>
            <PagePreviewScaler>
              <A4Page issue={qaIssueStateB} pageNumber={1} />
            </PagePreviewScaler>
          </div>
        </div>

        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase text-paper">
            Изолированный тест: "В номере" с 2–3 пунктами разной длины
          </p>
          <div className="max-w-md bg-paper p-[8mm]">
            <ContentsBlock entries={qaContentsVariants} />
          </div>
        </div>
      </div>
    </main>
  );
}
