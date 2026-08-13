/**
 * Route-level loading state. Pages here await a database read with no
 * Suspense boundary, so a slow read rendered a blank white screen. This is
 * deliberately quiet — a skeleton that mimics the newspaper rules rather
 * than a spinner, and no animation, so it costs nothing under
 * prefers-reduced-motion.
 */

const mono = { fontFamily: "var(--font-plex-mono), monospace" };

function Bar({ w, h = 14 }: { w: string; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: "var(--line)",
        marginTop: "var(--space-3)",
      }}
    />
  );
}

export default function Loading() {
  return (
    <main
      style={{
        maxWidth: "var(--w-prose)",
        margin: "0 auto",
        padding: "var(--space-10) var(--space-6) var(--space-16)",
      }}
      aria-busy="true"
    >
      <p
        role="status"
        style={{
          ...mono,
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "var(--fg-muted)",
          margin: 0,
        }}
      >
        LOADING…
      </p>

      <div
        style={{
          borderTop: "2px solid var(--line-strong)",
          marginTop: "var(--space-2)",
          paddingTop: "var(--space-5)",
        }}
      >
        <Bar w="70%" h={30} />
        <Bar w="45%" h={30} />
        <Bar w="100%" />
        <Bar w="96%" />
        <Bar w="88%" />
      </div>
    </main>
  );
}
