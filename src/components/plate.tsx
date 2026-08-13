/**
 * How a plate is printed.
 *
 * Three surfaces, one system:
 *   <PlateFigure>  the case file lead — the whole painting, in colour, with its
 *                  credit, its allegory, and (where the desk has marked one)
 *                  a magnified detail of the con itself.
 *   <PlateThumb>   index rows and grids — a focal crop inside a hairline rule.
 *   <PlateHero>    the front-page lead — full bleed under an ink scrim.
 *
 * Two rules hold the system together, and both were settled by looking at
 * printed comps rather than by argument:
 *
 * 1. Type never sits on paint. Captions live on paper, below the plate. The
 *    hero and the social card are the only exceptions, and only because a
 *    lead image with no headline is not a lead.
 * 2. Small surfaces crop to the plate's focal point rather than to its
 *    centre. A square thumbnail of a Bruegel is otherwise a patch of sky.
 *
 * The house grade is baked into the file by scripts/fetch-plates.mjs, never
 * applied here — a CSS filter would not survive into the social card, and the
 * picture must be the same picture everywhere it appears.
 */
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Cover } from "@/lib/covers";

const mono: CSSProperties = { fontFamily: "var(--font-plex-mono), monospace" };

const captionLine: CSSProperties = {
  ...mono,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: ".05em",
  lineHeight: 1.5,
  color: "var(--meta)",
  margin: 0,
};

/**
 * The plate number, printed in the one action colour. It numbers the
 * painting, not the story: two case files that lead with the same picture show
 * the same number, which is the point.
 */
function PlateNo({ no }: { no: number }) {
  return (
    <span style={{ color: "var(--orange)", fontWeight: 600 }}>
      PLATE No.&nbsp;{String(no).padStart(2, "0")}
    </span>
  );
}

/** The case file lead. */
export function PlateFigure({
  cover,
  priority,
}: {
  cover: Cover;
  priority?: boolean;
}) {
  const { plate } = cover;
  const tell = plate.tell;

  return (
    <figure style={{ margin: "24px 0 0" }}>
      {/* Tall plates are capped rather than printed at full height. A
          portrait Reymerswaele runs past 1000px in this column, which puts
          the summary — the part a frightened reader came for — below the
          fold. The cap crops to the plate's focal point, so what survives is
          the part of the picture that carries the argument. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${cover.plate.width} / ${cover.plate.height}`,
          maxHeight: "72vh",
          overflow: "hidden",
          border: "1px solid var(--ink)",
        }}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(max-width: 820px) 100vw, 780px"
          style={{ objectFit: "cover", objectPosition: cover.focal }}
        />
      </div>
      <figcaption
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: tell ? "72px 1fr" : "1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        {tell && (
          <span
            aria-hidden="true"
            style={{
              width: 72,
              height: 72,
              overflow: "hidden",
              border: "1px solid var(--ink)",
              display: "block",
              position: "relative",
            }}
          >
            {/* The same file, magnified on the detail that gives the con
                away. Decorative: the caption already says what it shows. */}
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="72px"
              style={{
                objectFit: "cover",
                objectPosition: tell.focal,
                transform: `scale(${tell.zoom})`,
                transformOrigin: tell.focal,
              }}
            />
          </span>
        )}
        <span style={{ display: "grid", gap: 4 }}>
          <span style={captionLine}>
            <PlateNo no={plate.no} />
            {" — "}
            <a
              href={cover.source}
              rel="noopener noreferrer"
              target="_blank"
              style={{ textDecoration: "none", borderBottom: "1px solid var(--rule)" }}
            >
              {cover.credit.toUpperCase()}
            </a>
            {" · "}
            {cover.collection.toUpperCase()}
          </span>
          <span style={{ ...captionLine, color: "var(--ink)" }}>
            {tell ? "THE TELL: " : "THE ALLEGORY: "}
            {cover.allegory.toUpperCase()}.
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Index rows and grids. Square, cropped to the focal point, hairline ruled. */
export function PlateThumb({
  cover,
  size = 104,
}: {
  cover: Cover;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "block",
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--ink)",
        background: "var(--panel)",
        flexShrink: 0,
      }}
    >
      <Image
        src={cover.src}
        alt=""
        fill
        sizes={`${size}px`}
        style={{ objectFit: "cover", objectPosition: cover.focal }}
      />
    </span>
  );
}

/**
 * The front-page lead. The one place type sits on paint, so the scrim is
 * doing real work: it has to carry a headline at any window size without
 * turning the painting into wallpaper.
 */
export function PlateHero({ cover }: { cover: Cover }) {
  return (
    <>
      <Image
        src={cover.src}
        alt={cover.alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: cover.focal }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          // Ramps early and hard enough to carry the orange kicker, which is
          // small caps and the first thing to disappear over mid-tone paint.
          background:
            "linear-gradient(180deg, rgba(14,14,12,0.05) 18%, rgba(14,14,12,0.64) 56%, rgba(14,14,12,0.93) 92%)",
        }}
      />
    </>
  );
}

/** The hero's credit, printed over the scrim rather than on paper — the only
 *  caption in the system that does. */
export function PlateHeroCredit({ cover }: { cover: Cover }) {
  return (
    <p
      style={{
        ...mono,
        fontSize: 10,
        letterSpacing: ".05em",
        color: "rgba(255,255,255,0.66)",
        margin: "14px 0 0",
      }}
    >
      PLATE No.&nbsp;{String(cover.plate.no).padStart(2, "0")} —{" "}
      {cover.credit.toUpperCase()} · {cover.collection.toUpperCase()}
    </p>
  );
}
