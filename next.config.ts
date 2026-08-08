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
};

const withMDX = createMDX({
  // No remark/rehype plugins. If any are added later they must be specified
  // as strings (Turbopack cannot receive JS functions).
});

export default withMDX(nextConfig);
