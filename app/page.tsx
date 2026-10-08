"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listIssues, deleteIssue } from "@/lib/db/issues";
import { Issue } from "@/lib/content/issue";
import { formatIssueDate } from "@/lib/content/format";
import { PageThumbnail } from "@/components/editor/PageThumbnail";
import { exportIssueToFile, importIssueFromFile } from "@/lib/db/issueFile";

/** "1 страница", "2 страницы", "5 страниц" — число страниц выпуска
 *  теперь меняется (страницы можно добавлять и удалять). */
function pagesLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} страница`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} страницы`;
  return `${count} страниц`;
}

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

  const [importError, setImportError] = useState<string | null>(null);

  async function handleImport(file: File) {
    setImportError(null);
    try {
      await importIssueFromFile(file);
      await reload();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteIssue(pendingDelete.id);
    setPendingDelete(null);
    reload();
  }

  return (
    <main className="flex h-screen flex-col bg-paper font-body text-ink">
      {/* Логотип — строго по центру, у самого верха экрана (QA: "строго
          по центру сверху экрана"), а не прижат к левому краю вместе
          с остальным контентом. Увеличен ещё в полтора раза сверх
          прежнего размера (QA: "увеличить примерно до 150% от текущего
          размера" — было h-[10.5rem]/h-[13.5rem], стало h-[15.75rem]/
          h-[20.25rem]). Обычный normal-режим наложения (QA: "ставь это
          и режим наложения normal" — multiply и overlay не подошли,
          финальная версия картинки без смешения с фоном). h1 оставлен
          как sr-only — тот же видимый текст "КОБОЛЬТ-Б", что и раньше,
          просто не глазами: доступность для скринридеров и не ломает
          существующую проверку dashboard.spec.ts.

          Логотип + заголовок "Выпуски" + разделитель ниже вынесены в
          отдельный flex-shrink-0 блок ВНЕ прокручиваемой области (QA:
          "список выпусков должен прокручиваться независимо, при этом
          визуально уходить/скрываться ПОД верхним divider... карточки
          не должны наезжать на него"). Раньше вся страница была одним
          общим потоком (body/main целиком скроллился) — весь экран
          лежит в flex-col на h-screen, шапка ниже не резиновая
          (flex-shrink-0), а список живёт в СВОЁМ overflow-y-auto
          контейнере — физически отдельная область прокрутки не может
          наложиться на шапку выше, а не просто визуально "спрятана"
          z-index-трюком. */}
      <div className="flex-shrink-0">
        <h1 className="sr-only">КОБОЛЬТ-Б</h1>
        <div className="flex justify-center pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/kobolt-b-logo-v3.png"
            alt="КОБОЛЬТ-Б — конструктор боевого листка танкового батальона"
            className="h-[15.75rem] w-auto mix-blend-normal sm:h-[20.25rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl px-8 pt-4">
          <div className="mt-8 border-t border-ink/20 pt-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-olive">
              Выпуски
            </h2>
          </div>
        </div>
      </div>

      {/* Прокручиваемая область — своя, независимая от шапки выше (см.
          комментарий там же). pb-44 сохраняет прежний зазор от
          закреплённой снизу кнопки "Создать выпуск". */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="mx-auto max-w-2xl px-8 pt-2">
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
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* Превью выпуска на начальном экране (QA: "превью
                      страниц выпусков... брать титульный лист") — тот
                      же PageThumbnail, что уже используется в списке
                      страниц редактора, просто страница 1 (обложка).
                      Один источник рендера (A4Page) — превью здесь
                      никогда не разойдётся с тем, что реально в
                      выпуске, само по себе (например, после смены
                      cover-v1 ↔ cover-v2). */}
                  <PageThumbnail issue={issue} pageNumber={1} widthPx={48} />
                  <div className="min-w-0">
                    {/* Компактнее (QA: "уменьшить размер шрифта,
                        межстрочное расстояние, сохранить иерархию") —
                        было без явного размера (унаследованный ~16px
                        браузерный) и обычного line-height; text-sm +
                        leading-tight держат её визуально крупнее и
                        жирнее подписи ниже (сохранена иерархия), но
                        сама строка теперь не растягивает высоту карточки. */}
                    <p
                      data-testid="issue-row-title"
                      className="font-display text-sm font-bold uppercase leading-tight"
                    >
                      Выпуск № {issue.number} — {formatIssueDate(issue.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-olive-dim">
                      {pagesLabel(Object.keys(issue.pages).length)} · изменён {formatUpdatedAt(issue.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex flex-shrink-0 gap-2">
                  <Link
                    href={`/issues/${issue.id}`}
                    data-testid="open-issue-link"
                    className="rounded-hairline border border-ink/20 px-3 py-1.5 text-xs text-ink hover:border-ink/40"
                  >
                    Открыть
                  </Link>
                  <button
                    onClick={() => exportIssueToFile(issue)}
                    data-testid="export-issue-button"
                    className="rounded-hairline border border-ink/20 px-3 py-1.5 text-xs text-ink hover:border-ink/40"
                  >
                    Экспорт
                  </button>
                  <button
                    onClick={() => setPendingDelete(issue)}
                    data-testid="delete-issue-button"
                    className="rounded-hairline border border-ink/20 px-3 py-1.5 text-xs text-olive-dim hover:border-accent hover:text-accent"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Кнопка "Создать выпуск" закреплена внизу экрана (QA: "кнопку
          создать выпуск внизу экрана ставим, чтоб удобней было" — на
          телефоне это ближе к большому пальцу, чем верх страницы, где
          она была раньше). */}
      <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-paper/95 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          {importError && (
            <p data-testid="import-issue-error" className="mb-2 text-center text-xs text-accent">
              {importError}
            </p>
          )}
          <label
            data-testid="import-issue-label"
            className="mb-2 block cursor-pointer border border-ink/20 px-4 py-2 text-center text-xs font-bold text-ink hover:border-ink/40"
          >
            Импорт макета из файла
            <input
              type="file"
              accept=".json,application/json"
              data-testid="import-issue-input"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = "";
              }}
            />
          </label>
          <Link
            href="/issues/new"
            data-testid="create-issue-link"
            className="block bg-accent px-4 py-3 text-center font-display font-bold tracking-wide text-paper"
          >
            + Создать выпуск
          </Link>
        </div>
      </div>

      {pendingDelete && (
        <div
          data-testid="delete-confirm-dialog"
          className="fixed inset-0 flex items-center justify-center bg-ink/40 p-4"
        >
          <div className="max-w-sm rounded-card bg-paper p-5">
            <p className="font-display font-bold uppercase">Удалить выпуск?</p>
            <p className="mt-2 text-sm text-olive-dim">
              Выпуск № {pendingDelete.number} от {formatIssueDate(pendingDelete.date)} будет удалён
              безвозвратно.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                data-testid="cancel-delete-button"
                className="rounded-hairline border border-ink/20 px-3 py-1.5 text-xs"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                data-testid="confirm-delete-button"
                className="bg-accent px-3 py-1.5 text-xs text-paper"
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
