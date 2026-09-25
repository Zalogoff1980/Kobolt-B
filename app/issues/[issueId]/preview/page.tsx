"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getIssue } from "@/lib/db/issues";
import { Issue } from "@/lib/content/issue";
import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";

export default function IssuePreviewPage({ params }: { params: { issueId: string } }) {
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);

  useEffect(() => {
    getIssue(params.issueId).then((found) => setIssue(found ?? null));
  }, [params.issueId]);

  if (issue === undefined) {
    return <main className="p-8 font-body text-ink">Загрузка…</main>;
  }
  if (issue === null) {
    return (
      <main className="p-8 font-body text-ink">
        <p>Выпуск не найден.</p>
        <Link href="/" className="text-accent underline">
          Вернуться к списку
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#4a4a42] p-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/issues/${issue.id}`} className="text-sm text-paper/80 underline">
          ← Назад к выпуску
        </Link>

        <p className="mt-2 text-xs uppercase tracking-wide text-paper/60">
          Базовый preview · страница 1 из 4 (обложка) — остальные страницы появятся
          на следующих шагах
        </p>

        <div className="mt-4">
          <PagePreviewScaler>
            <A4Page issue={issue} pageNumber={1} />
          </PagePreviewScaler>
        </div>
      </div>
    </main>
  );
}
