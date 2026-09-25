"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listIssues, deleteIssue } from "@/lib/db/issues";
import { Issue } from "@/lib/content/issue";
import { formatIssueDate } from "@/lib/content/format";

const PAGE_COUNT = 4; // формат выпуска фиксирован ТЗ: ровно 4 страницы

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Issue | null>(null);

  async function reload() {
    setIssues(await listIssues());
  }

  useEffect(() => {
    reload();
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteIssue(pendingDelete.id);
    setPendingDelete(null);
    reload();
  }

  return (
    <main className="min-h-screen bg-paper p-8 font-body text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">КОБОЛЬТ-Б</h1>
        <p className="mt-1 text-olive-dim">
          Конструктор внутреннего боевого листка танкового батальона
        </p>

        <Link
          href="/issues/new"
          data-testid="create-issue-link"
          className="mt-6 inline-block bg-accent px-4 py-2 font-display font-bold uppercase tracking-wide text-paper"
        >
          + Создать выпуск
        </Link>

        <div className="mt-8 border-t border-ink/20 pt-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-olive">
            Выпуски
          </h2>

          {issues === null && <p className="mt-2 text-olive-dim">Загрузка…</p>}

          {issues?.length === 0 && (
            <div
              data-testid="dashboard-empty-state"
              className="mt-4 border border-dashed border-ink/20 p-6 text-center"
            >
              <p className="text-olive-dim">Пока нет ни одного выпуска.</p>
              <Link href="/issues/new" className="mt-2 inline-block text-sm text-accent underline">
                Создать первый выпуск
              </Link>
            </div>
          )}

          <ul className="mt-2 divide-y divide-ink/10">
            {issues?.map((issue) => (
              <li
                key={issue.id}
                data-testid="issue-row"
                data-issue-id={issue.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p data-testid="issue-row-title" className="font-display font-bold uppercase">
                    Выпуск № {issue.number} — {formatIssueDate(issue.date)}
                  </p>
                  <p className="mt-0.5 text-xs text-olive-dim">
                    {PAGE_COUNT} страницы · изменён {formatUpdatedAt(issue.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <Link
                    href={`/issues/${issue.id}`}
                    data-testid="open-issue-link"
                    className="border border-ink/20 px-3 py-1.5 text-xs uppercase text-ink hover:border-ink/40"
                  >
                    Открыть
                  </Link>
                  <button
                    onClick={() => setPendingDelete(issue)}
                    data-testid="delete-issue-button"
                    className="border border-ink/20 px-3 py-1.5 text-xs uppercase text-olive-dim hover:border-accent hover:text-accent"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {pendingDelete && (
        <div
          data-testid="delete-confirm-dialog"
          className="fixed inset-0 flex items-center justify-center bg-ink/40 p-4"
        >
          <div className="max-w-sm bg-paper p-5">
            <p className="font-display font-bold uppercase">Удалить выпуск?</p>
            <p className="mt-2 text-sm text-olive-dim">
              Выпуск № {pendingDelete.number} от {formatIssueDate(pendingDelete.date)} будет удалён
              безвозвратно.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                data-testid="cancel-delete-button"
                className="border border-ink/20 px-3 py-1.5 text-xs uppercase"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                data-testid="confirm-delete-button"
                className="bg-accent px-3 py-1.5 text-xs uppercase text-paper"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
