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
};

const withMDX = createMDX({
  // No remark/rehype plugins. If any are added later they must be specified
  // as strings (Turbopack cannot receive JS functions).
});

export default withMDX(nextConfig);
