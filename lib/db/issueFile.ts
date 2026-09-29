"use client";

import { Issue } from "@/lib/content/issue";
import { dbPut } from "./indexedDb";

/**
 * Перенос выпуска между устройствами (IndexedDB у каждого браузера
 * своя, поэтому макет «с одной машины на другую» — только файлом).
 * Файл — обычный JSON `.kobolt.json`: макет целиком (тексты, шаблоны,
 * фон, фото внутри как data-URL), без привязки к устройству.
 */

const FORMAT = "kobolt-b-issue";
const VERSION = 1;

type IssueFile = { format: typeof FORMAT; version: number; exportedAt: string; issue: Issue };

export function issueFileName(issue: Issue): string {
  const num = issue.number.replace(/[^\p{L}\p{N}-]+/gu, "-") || "vypusk";
  return `kobolt-b-maket-${num}.kobolt.json`;
}

/** Скачать выпуск файлом. */
export function exportIssueToFile(issue: Issue): void {
  const payload: IssueFile = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    issue,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = issueFileName(issue);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isIssueLike(v: unknown): v is Issue {
  if (!v || typeof v !== "object") return false;
  const i = v as Partial<Issue>;
  if (typeof i.number !== "string" || typeof i.date !== "string" || !i.pages) return false;
  return ([1, 2, 3, 4] as const).every((n) => {
    const p = (i.pages as Record<number, Issue["pages"][1] | undefined>)[n];
    return !!p && Array.isArray(p.content?.blocks);
  });
}

/** Прочитать файл макета и сохранить как НОВЫЙ выпуск (новый id — уже
 *  существующие выпуски на этом устройстве никогда не перезаписываются). */
export async function importIssueFromFile(file: File): Promise<Issue> {
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("Файл не читается: это не файл макета КОБОЛЬТ-Б.");
  }
  const f = data as Partial<IssueFile>;
  if (f?.format !== FORMAT || !isIssueLike(f.issue)) {
    throw new Error("Это не файл макета КОБОЛЬТ-Б (или он повреждён).");
  }
  if (typeof f.version === "number" && f.version > VERSION) {
    throw new Error("Файл создан более новой версией приложения. Обновите страницу и повторите.");
  }
  const now = new Date().toISOString();
  const issue: Issue = { ...f.issue, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  await dbPut(issue);
  return issue;
}
