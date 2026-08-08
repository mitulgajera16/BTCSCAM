import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

const mono = { fontFamily: "var(--font-plex-mono), monospace" } as const;
const display = { fontFamily: "var(--font-fraunces), serif" } as const;

/* Class-scoped CSS for pieces inline styles can't reach (markdown-generated
   nesting, print). Editorial law: no italics anywhere; letter-spacing 0 or
   .05em only; red is danger-only. */
const guideCss = `
.guide-pull p {
  font-family: var(--font-fraunces), serif;
  font-size: 21px;
  font-weight: 600;
  line-height: 1.45;
  margin: 0;
}
main.guide-article pre code {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; }
  main.guide-article { max-width: 100% !important; padding: 0 !important; }
  main.guide-article h1 { font-size: 21pt !important; line-height: 1.1 !important; }
  main.guide-article h2 { font-size: 13pt !important; margin-top: 14pt !important; margin-bottom: 6pt !important; }
  main.guide-article h3 { font-size: 11pt !important; margin-top: 10pt !important; margin-bottom: 4pt !important; }
  main.guide-article p, main.guide-article li, main.guide-article td {
    font-size: 9.5pt !important;
    line-height: 1.45 !important;
  }
  main.guide-article a { color: #000 !important; text-decoration: none !important; }
  main.guide-article figure, main.guide-article blockquote, main.guide-article pre { break-inside: avoid; }
  main.guide-article h2, main.guide-article h3 { break-after: avoid; }
}
`;

const components: MDXComponents = {
  /* Every .mdx page renders inside the newspaper guide column. */
  wrapper: ({ children }: { children?: ReactNode }) => (
    <main
      className="guide-article"
      style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}
    >
      <style>{guideCss}</style>
      <nav className="no-print" style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / </span>
        <Link href="/guides">PROTECT YOURSELF</Link>
        <span style={{ color: "var(--meta)" }}> / GUIDE</span>
      </nav>
      {children}
    </main>
  ),
  h1: ({ children }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      style={{
        ...display,
        fontSize: "clamp(32px, 6vw, 40px)",
        fontWeight: 600,
        lineHeight: 1.15,
        margin: "8px 0 0",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      style={{
        ...display,
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.25,
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        margin: "48px 0 16px",
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      style={{
        ...display,
        fontSize: 21,
        fontWeight: 600,
        lineHeight: 1.3,
        margin: "32px 0 8px",
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: ComponentPropsWithoutRef<"p">) => (
    <p style={{ fontSize: 16, lineHeight: 1.6, margin: "16px 0" }}>{children}</p>
  ),
  a: ({ href, children }: ComponentPropsWithoutRef<"a">) => {
    if (href && href.startsWith("/")) {
      return (
        <Link href={href} style={{ color: "var(--link)" }}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} rel="noopener" style={{ color: "var(--link)" }}>
        {children}
      </a>
    );
  },
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
    <ul style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 20, margin: "16px 0" }}>
      {children}
    </ul>
  ),
  ol: ({ children }: ComponentPropsWithoutRef<"ol">) => (
    <ol style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 24, margin: "16px 0" }}>
      {children}
    </ol>
  ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => (
    <li style={{ marginBottom: 8 }}>{children}</li>
  ),
  strong: ({ children }: ComponentPropsWithoutRef<"strong">) => (
    <strong style={{ fontWeight: 700 }}>{children}</strong>
  ),
  /* Editorial law: NO italics. Emphasis renders upright at weight 700. */
  em: ({ children }: ComponentPropsWithoutRef<"em">) => (
    <em style={{ fontStyle: "normal", fontWeight: 700 }}>{children}</em>
  ),
  i: ({ children }: ComponentPropsWithoutRef<"i">) => (
    <i style={{ fontStyle: "normal", fontWeight: 700 }}>{children}</i>
  ),
  code: ({ children }: ComponentPropsWithoutRef<"code">) => (
    <code
      style={{
        ...mono,
        fontSize: "0.875em",
        fontWeight: 500,
        background: "var(--panel)",
        border: "1px solid var(--rule)",
        padding: "1px 5px",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      style={{
        ...mono,
        fontSize: 14,
        lineHeight: 1.5,
        background: "var(--panel)",
        border: "1px solid var(--rule)",
        padding: 16,
        overflowX: "auto",
        margin: "20px 0",
      }}
    >
      {children}
    </pre>
  ),
  /* Ruled pull — double rule above, hairline below. No italics. */
  blockquote: ({ children }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="guide-pull"
      style={{
        borderTop: "3px double var(--ink)",
        borderBottom: "1px solid var(--rule)",
        margin: "24px 0",
        padding: "16px 4px",
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ border: "none", borderTop: "3px double var(--ink)", margin: "40px 0" }} />
  ),
  table: ({ children }: ComponentPropsWithoutRef<"table">) => (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>{children}</table>
    </div>
  ),
  th: ({ children }: ComponentPropsWithoutRef<"th">) => (
    <th
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        textAlign: "left",
        borderBottom: "2px solid var(--ink)",
        padding: "8px 12px 8px 0",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }: ComponentPropsWithoutRef<"td">) => (
    <td
      style={{
        fontSize: 14,
        lineHeight: 1.5,
        borderBottom: "1px solid var(--rule)",
        padding: "10px 12px 10px 0",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
