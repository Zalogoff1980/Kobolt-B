/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // puppeteer-core/@sparticuz/chromium ship native binaries and
    // dynamic requires that Next's default server bundler shouldn't try
    // to statically analyze/tree-shake — standard recommendation for
    // these packages on Next.js.
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
    // Next's output file tracing decides which node_modules files get
    // bundled into each serverless function by statically following
    // require()/import calls. @sparticuz/chromium loads its Chromium
    // binary AND its supporting shared libraries (libnss3.so and
    // friends) via fs paths at runtime, not via a literal require(), so
    // the tracer can't see they're needed and prunes them — producing
    // exactly the "libnss3.so: cannot open shared object file" failure
    // seen on the real Vercel deployment. This explicitly forces the
    // whole @sparticuz/chromium package directory into the /api/pdf
    // function's bundle.
    // The key is a route-path glob (matched against the request path,
    // not the source file path) — using "app/api/pdf/route.ts" here
    // previously matched nothing, so the include had no effect. "/api/**"
    // matches every API route, which safely covers /api/pdf regardless
    // of the exact matching convention Next.js expects.
    outputFileTracingIncludes: {
      "/api/**": ["./node_modules/@sparticuz/chromium/**/*"],
    },
  },
};
module.exports = nextConfig;
