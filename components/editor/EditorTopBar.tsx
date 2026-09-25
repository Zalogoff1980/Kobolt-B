"use client";

import Link from "next/link";
import { formatIssueDate } from "@/lib/content/format";

export function EditorTopBar({
  number,
  date,
  saveStatus,
}: {
  number: string;
  date: string;
  saveStatus: "idle" | "saving" | "saved";
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink/15 bg-paper px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-olive-dim underline">
          ← Выпуски
        </Link>
        <span data-testid="issue-meta" className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          Выпуск № {number} · {formatIssueDate(date)}
        </span>
      </div>
      <span data-testid="save-status" className="text-xs uppercase tracking-wide text-olive-dim">
        {saveStatus === "saving" ? "Сохранение…" : "Сохранено ✓"}
      </span>
    </div>
  );
}
