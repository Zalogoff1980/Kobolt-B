import puppeteer, { Browser } from "puppeteer-core";

// Launches headless Chromium for /api/pdf.
//
// Two environments, two ways to find the binary, both through the same
// lightweight puppeteer-core (no bundled Chromium of its own):
//
// 1. Vercel/production: @sparticuz/chromium, a Chromium build made for
//    serverless functions. Detected via process.env.VERCEL.
// 2. Local / Codespaces: an explicit path to an already-installed
//    Chromium via PUPPETEER_EXECUTABLE_PATH (or PDF_CHROMIUM_PATH), or a
//    few common system paths as a fallback.
export async function launchPdfBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    // @sparticuz/chromium decides whether it's running on a Lambda-like
    // container (and therefore needs to extract its bundled Chromium
    // binary + shared libraries such as libnss3.so) by checking for
    // AWS-Lambda-specific environment variables. Vercel's functions are
    // Lambda-like but don't set those variables, so on older package
    // versions the extraction step silently never ran, producing
    // "libnss3.so: cannot open shared object file" at launch time. Set
    // a fallback value (only if unset) so detection succeeds here too.
    process.env.AWS_LAMBDA_JS_RUNTIME ??= "nodejs22.x";

    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      // A4Page's own CSS fixes each page at 210mm x 297mm regardless of
      // viewport size, and route.ts prints via page.pdf() rather than a
      // screenshot, so the actual viewport dimensions don't affect the
      // output — no need to set one explicitly. (The 141.x release of
      // this package also dropped the old `chromium.defaultViewport`
      // property this used to read.)
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const candidatePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.PDF_CHROMIUM_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter((p): p is string => Boolean(p));

  const fs = await import("fs");
  const executablePath = candidatePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (!executablePath) {
    throw new Error(
      "No local Chromium executable found for PDF rendering. Set the " +
        "PUPPETEER_EXECUTABLE_PATH environment variable to point at an " +
        "installed Chromium (for example, the Playwright path under " +
        "the ms-playwright cache directory after running " +
        "npx playwright install chromium), or install a system " +
        "google-chrome/chromium binary."
    );
  }

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}
