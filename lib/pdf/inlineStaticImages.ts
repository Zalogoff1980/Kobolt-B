import { promises as fs } from "fs";
import path from "path";

/**
 * Puppeteer's page.setContent() renders a bare HTML string with no
 * origin to resolve against — a normal `<img src="/engravings/...">`
 * or `<img src="/emblems/...">` (both work fine in the live browser
 * preview, served straight out of Next's public/ folder) would just
 * fail to load in the PDF, same class of problem lib/pdf/googleFonts.ts
 * already solves for webfonts. This inlines any static public/ image
 * reference under one of the known asset folders found in the
 * rendered markup as a base64 data: URI read straight from public/,
 * so the exact same img src in the exact same A4Page markup works in
 * both places without the component itself knowing about PDF vs
 * browser at all.
 *
 * Only touches what's actually present in the markup (a handful of
 * images per page at most), so this stays cheap even as more static
 * asset folders are added later — just extend the regex below.
 */
const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const cache = new Map<string, Promise<string | null>>();

async function readAsDataUrl(publicPath: string): Promise<string | null> {
  const ext = path.extname(publicPath).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;
  try {
    const absolute = path.join(process.cwd(), "public", publicPath);
    const buf = await fs.readFile(absolute);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function inlineEngravingImages(html: string): Promise<string> {
  const matches = Array.from(html.matchAll(/src="(\/(?:engravings|emblems)\/[^"]+)"/g));
  if (matches.length === 0) return html;

  // m[1] is the regex's own capture group — always present whenever the
  // overall match succeeds, but tsconfig's noUncheckedIndexedAccess
  // still widens indexed access to `string | undefined`, so filter with
  // an explicit type guard instead of a non-null assertion.
  const uniquePaths = Array.from(
    new Set(matches.map((m) => m[1]).filter((p): p is string => typeof p === "string"))
  );
  const entries = await Promise.all(
    uniquePaths.map(async (p) => {
      if (!cache.has(p)) cache.set(p, readAsDataUrl(p));
      return [p, await cache.get(p)!] as const;
    })
  );

  let out = html;
  for (const [publicPath, dataUrl] of entries) {
    if (!dataUrl) continue; // leave as-is (missing file) rather than corrupt the src attribute
    out = out.split(`src="${publicPath}"`).join(`src="${dataUrl}"`);
  }
  return out;
}
