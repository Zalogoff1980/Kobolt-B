"use client";

import { useState } from "react";
import { Issue } from "@/lib/content/issue";
import { OVERFLOW_MESSAGE } from "./guides/ContentZoneOverlay";
import { prepareIssueForPdf } from "@/lib/pdf/prepareIssueForPdf";

/**
 * "Поделиться" — черновой шаринг макета в Telegram/почту прямо с
 * телефона, пока финальные гравюры ещё не готовы (пользователь: "пока
 * художник делает финал гравюры — зафигачим шаринг макета в телеграм и
 * почту"). Никакого бэкенда/токенов не заводим (никакого Telegram-бота,
 * никакого SMTP) — используем тот же PDF, что уже собирает
 * DownloadPdfButton через /api/pdf, и передаём его системному диалогу
 * "Поделиться" через Web Share API (navigator.share с files) — Telegram,
 * почтовый клиент и всё остальное, что установлено на телефоне, уже
 * само является пунктом в этом системном меню.
 *
 * Web Share API с файлами поддерживается в мобильных браузерах
 * (Android Chrome, iOS Safari), но НЕ в большинстве десктопных — на
 * десктопе (или если canShare с files вернул false) просто скачиваем
 * файл, как и обычная кнопка "Скачать PDF", и явно говорим об этом в
 * статусе, а не притворяемся, что "Поделиться" сработало.
 */
export function ShareButton({
  issue,
  overflowingPages,
}: {
  issue: Issue;
  overflowingPages: number[];
}) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "shared" | "downloaded">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function pdfFileName(): string {
    return `kobolt-b-vypusk-${issue.number.replace(/[^\p{L}\p{N}-]+/gu, "-")}.pdf`;
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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
      // Тот же путь сжатия перед /api/pdf, что и у "Скачать PDF" —
      // серверный лимит тела запроса на Vercel тот же самый.
      const pdfIssue = await prepareIssueForPdf(issue);
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfIssue),
      });
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error(
            "Фото в выпуске слишком большие даже после сжатия — уменьшите " +
              "количество или разрешение фотографий и попробуйте снова."
          );
        }
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Сервер вернул ошибку ${res.status}`);
      }
      const blob = await res.blob();
      const file = new File([blob], pdfFileName(), { type: "application/pdf" });

      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };
      const shareData = {
        files: [file],
        title: `КОБОЛЬТ-Б — выпуск №${issue.number}`,
        text: `Боевой листок, выпуск №${issue.number} от ${issue.date}`,
      };

      if (nav.share && nav.canShare?.(shareData)) {
        try {
          await nav.share(shareData);
          setState("shared");
          return;
        } catch (shareErr) {
          // Пользователь просто закрыл системное меню "Поделиться" —
          // это не ошибка, а его собственный выбор, ничего не скачиваем
          // и не показываем как сбой.
          if (shareErr instanceof DOMException && shareErr.name === "AbortError") {
            setState("idle");
            return;
          }
          // Другая ошибка самого share() (редко) — откатываемся на
          // обычное скачивание ниже, а не молчим о проблеме.
        }
      }

      // Web Share API с файлами недоступен (десктоп, старый браузер,
      // или canShare отклонил именно эти файлы) — скачиваем, как
      // обычная кнопка "Скачать PDF", и явно называем это в статусе.
      downloadBlob(blob);
      setState("downloaded");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  const label =
    state === "loading"
      ? "Готовим PDF…"
      : state === "shared"
        ? "Отправлено ✓"
        : state === "downloaded"
          ? "Файл скачан"
          : "Поделиться";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        data-testid="share-pdf-button"
        className="rounded-hairline border border-ink/20 bg-paper px-3 py-1.5 text-xs text-ink hover:bg-ink/5 disabled:cursor-wait disabled:opacity-60"
      >
        {label}
      </button>
      {state === "downloaded" && (
        <p className="max-w-[220px] text-right text-[11px] text-olive-dim">
          «Поделиться» недоступно в этом браузере — файл скачан, отправьте его вручную.
        </p>
      )}
      {state === "error" && errorMessage && (
        <p data-testid="share-pdf-error" className="max-w-[220px] text-right text-[11px] text-accent">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
