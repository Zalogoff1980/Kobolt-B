"use client";

import { useState } from "react";
import { Issue } from "@/lib/content/issue";
import { OVERFLOW_MESSAGE } from "./guides/ContentZoneOverlay";

/**
 * "Скачать PDF" (ТЗ шага PDF, п.13). Работает и на desktop, и на
 * mobile — это тот же компонент в общей EditorTopBar, которая уже
 * адаптивна.
 *
 * Перед отправкой на /api/pdf проверяет `overflowingPages` (посчитан
 * HiddenOverflowProbe в editor page тем же способом, что и editor
 * guides — реальный DOM, а не оценка на глаз): если хоть одна из 4
 * страниц физически не помещается в свой шаблон, PDF НЕ запрашивается
 * вообще — вместо тихой обрезки в файле показывается ровно та же
 * политика overflow, что и в редакторе (п.12 ТЗ).
 */
export function DownloadPdfButton({
  issue,
  overflowingPages,
}: {
  issue: Issue;
  overflowingPages: number[];
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    if (overflowingPages.length > 0) {
      setState("error");
      setErrorMessage(
        `${OVERFLOW_MESSAGE} (страниц${overflowingPages.length > 1 ? "ы" : "а"}: ${overflowingPages.join(", ")})`
      );
      return;
    }

    setState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issue),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Сервер вернул ошибку ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kobolt-b-vypusk-${issue.number.replace(/[^\p{L}\p{N}-]+/gu, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        data-testid="download-pdf-button"
        className="rounded-hairline border border-ink/20 bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink/90 disabled:cursor-wait disabled:opacity-60"
      >
        {state === "loading" ? "Формируем PDF…" : "Скачать PDF"}
      </button>
      {state === "error" && errorMessage && (
        <p data-testid="download-pdf-error" className="max-w-[220px] text-right text-[11px] text-accent">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
