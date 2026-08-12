import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md/.mdx files to act as pages (guides are authored in MDX).
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Pin the workspace root: a stray package-lock.json one directory up
  // (~/Desktop/Dev) otherwise triggers a root-inference warning on build.
  turbopack: {
    root: path.join(__dirname),
  },
  // The bundled incident registry (data/incidents/*.json) is read via fs at
  // RUNTIME by the no-Supabase fallback in src/lib/incidents.ts — from the
  // /check server action, both cron routes, revalidated feeds, and any page
  // regenerated after revalidateTag/Path. Trace the files into every server
  // function so the honest fallback survives serverless deployment. Next
  // matches these keys with picomatch in contains mode, so "/*" hits every
  // traced route; the payload is three small JSON files.
  outputFileTracingIncludes: {
    "/*": ["./data/incidents/*.json"],
  },
  // Baseline security headers. frame-ancestors 'none' + X-Frame-Options stop a
  // /check verdict (or a desk action) from being framed and clickjacked — the
  // verdict is safety UI, so its integrity matters. We deliberately do NOT set a
  // restrictive script-src CSP: the app relies on Next's inline runtime scripts
  // and inline JSON-LD, which a strict script-src would break; framing is the
  // real risk here and frame-ancestors closes it without that fragility.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  // No remark/rehype plugins. If any are added later they must be specified
  // as strings (Turbopack cannot receive JS functions).
});

export default withMDX(nextConfig);
