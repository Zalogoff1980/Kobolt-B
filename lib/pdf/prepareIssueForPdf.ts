"use client";

import { Issue } from "@/lib/content/issue";
import { PageNumber } from "@/lib/content/types";

/**
 * Shrinks embedded photo data URLs before an Issue is sent to /api/pdf.
 *
 * Vercel Serverless Functions enforce a hard ~4.5MB request body limit
 * that cannot be raised via any Next.js/Vercel config — it's a platform
 * boundary, not something route.ts can opt out of. The editor stores
 * photos as full-resolution data: URLs in IndexedDB (needed for a crisp
 * live preview and for zooming/cropping later), and the PDF export
 * contract sends the *entire* Issue JSON in one request body (so the
 * server stays IndexedDB-free) — with a few real photos across 4 pages
 * that full-resolution payload alone can exceed the limit, which is
 * exactly the "Сервер вернул ошибку 413" seen on the real deployment.
 *
 * This only affects the copy of the Issue sent to /api/pdf for this one
 * request — IndexedDB, the live preview and every other feature keep
 * using the original full-resolution photos untouched.
 */

const MAX_DIMENSION = 1600; // generous for a photo occupying part of an A4 page
const JPEG_QUALITY = 0.82;
const SKIP_IF_UNDER_BYTES = 300_000; // ~300KB data URLs are already small enough

function shrinkDataUrl(src: string): Promise<string> {
  if (!src.startsWith("data:image")) return Promise.resolve(src);
  if (src.length < SKIP_IF_UNDER_BYTES) return Promise.resolve(src);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        // Only use the re-encoded version if it's actually smaller —
        // a tiny/already-compressed source could theoretically grow
        // when forced through JPEG re-encoding.
        resolve(out.length < src.length ? out : src);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export async function prepareIssueForPdf(issue: Issue): Promise<Issue> {
  const pageNumbers: PageNumber[] = [1, 2, 3, 4];
  const pages = { ...issue.pages };

  for (const n of pageNumbers) {
    const page = pages[n];
    const blocks = await Promise.all(
      page.content.blocks.map(async (block) => {
        if (block.type !== "photo") return block;
        const src = await shrinkDataUrl(block.src);
        return src === block.src ? block : { ...block, src };
      })
    );
    pages[n] = { ...page, content: { ...page.content, blocks } };
  }

  return { ...issue, pages };
}
