"use client";

import Link from "next/link";
import { formatIssueDate } from "@/lib/content/format";
import { Issue } from "@/lib/content/issue";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { ShareButton } from "./ShareButton";

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
        <Link href="/" className="text-xs text-olive-dim underline">
          Выпуски
        </Link>
        <span data-testid="save-status" className="text-xs text-olive-dim">
          {saveStatus === "saving" ? "Сохранение…" : "Сохранено ✓"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span data-testid="issue-meta" className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          Выпуск №{issue.number} · {formatIssueDate(issue.date)}
        </span>
        <div className="flex items-start gap-2">
          <ShareButton issue={issue} overflowingPages={overflowingPages} />
          <DownloadPdfButton issue={issue} overflowingPages={overflowingPages} />
        </div>
      </div>
    </div>
  );
}
