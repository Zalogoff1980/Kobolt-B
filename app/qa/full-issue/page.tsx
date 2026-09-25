"use client";

import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { qaIssueFull, qaIssueMinimal } from "@/lib/content/qaFixturesFullIssue";
import { Issue } from "@/lib/content/issue";

/** Шаг 6: интеграционная QA — весь Issue (4 страницы) целиком, а не
 *  изолированные шаблоны. Два комплекта: заполненный и минимальный.
 *  Не пользовательский экран. */
function IssueRow({ label, issue }: { label: string; issue: Issue }) {
  return (
    <div>
      <p className="mb-2 font-display text-sm font-bold uppercase text-paper">{label}</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <p className="mb-1 text-xs uppercase text-paper/60">Стр. {n}</p>
            <PagePreviewScaler>
              <A4Page issue={issue} pageNumber={n as 1 | 2 | 3 | 4} />
            </PagePreviewScaler>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FullIssueQaPage() {
  return (
    <main className="min-h-screen bg-[#4a4a42] p-8">
      <div className="mx-auto max-w-7xl space-y-14">
        <p className="text-xs uppercase tracking-wide text-paper/60">
          QA: полный выпуск целиком (4 страницы) — единство дизайна, "В номере",
          нумерация, overflow — не пользовательский экран
        </p>
        <IssueRow label="Полный выпуск (обложка заполнена, 2=A, 3=B, 4=Команда×3)" issue={qaIssueFull} />
        <IssueRow label="Минимальный выпуск (обложка пустая, без фото где разрешено)" issue={qaIssueMinimal} />
      </div>
    </main>
  );
}
