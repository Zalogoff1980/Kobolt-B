"use client";

import Link from "next/link";
import { exportIssueToFile } from "@/lib/db/issueFile";
import { formatIssueDate } from "@/lib/content/format";
import { Issue } from "@/lib/content/issue";
import { DownloadPdfButton } from "./DownloadPdfButton";

/**
 * PRIORITY 5 — небольшой UI cleanup шапки редактора: "Выпуски" и
 * "Сохранено" на одной строке (обычный, не ALL CAPS текст, слегка
 * мельче), "ВЫПУСК №… · дата" — отдельной строкой ниже (эта строка,
 * в отличие от первой, — заголовок-лейбл в редакционном стиле, ей
 * ALL CAPS оставлен намеренно, как и было). Целевой макет из ТЗ:
 *
 *   Выпуски                         Сохранено ✓
 *   ВЫПУСК №12 · 26.09.2026
 */
export function EditorTopBar({
  issue,
  saveStatus,
  overflowingPages,
}: {
  issue: Issue;
  saveStatus: "idle" | "saving" | "saved";
  overflowingPages: number[];
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink/15 bg-chrome px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs font-semibold text-olive-dim underline">
          Выпуски
        </Link>
        <span data-testid="save-status" className="text-xs text-olive-dim">
          {saveStatus === "saving" ? "Сохранение…" : "Сохранено ✓"}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span data-testid="issue-meta" className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          Выпуск №{issue.number} · {formatIssueDate(issue.date)}
        </span>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => exportIssueToFile(issue)}
            data-testid="export-issue-button"
            title="Скачать макет файлом — чтобы открыть его на другом устройстве"
            className="h-8 appearance-none rounded-control border border-ink/20 bg-paper px-3 font-body text-xs font-semibold text-ink hover:border-ink/40 hover:bg-chrome/60"
          >
            Экспорт макета
          </button>
          <DownloadPdfButton issue={issue} overflowingPages={overflowingPages} />
        </div>
      </div>
    </div>
  );
}
