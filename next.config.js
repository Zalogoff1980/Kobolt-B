/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // puppeteer-core/@sparticuz/chromium (PDF export, /api/pdf) ship
  // native binaries and dynamic requires that Next's default
  // server bundler shouldn't try to statically analyze/tree-shake —
  // standard recommendation for these packages on Next.js.
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
};
module.exports = nextConfig;
