/**
 * The social card — the plate as most readers first meet it.
 *
 * A case file's link unfurl circulates independently of the site, so it has to
 * carry the whole argument alone: the painting, the headline, the severity,
 * and the credit. It is the one place in the system besides the front-page
 * hero where type sits on paint, and for the same reason — a lead image with
 * no headline is not a lead.
 *
 * The plate files already carry the house grade, baked in by the intake
 * pipeline, because satori cannot run CSS filters. That is the whole reason
 * the grade lives in the file rather than in a stylesheet: the picture in the
 * unfurl is the same picture as on the page.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Cover } from "./covers";

export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 };

const PAPER = "#fcfbf9";
const INK = "#0e0e0c";
const ORANGE = "#f7931a";
const DANGER = "#d2322e";

let fontCache: { fraunces: Buffer; mono: Buffer } | null = null;

async function fonts() {
  if (!fontCache) {
    const dir = join(process.cwd(), "assets", "fonts");
    const [fraunces, mono] = await Promise.all([
      readFile(join(dir, "Fraunces-SemiBold.ttf")),
      readFile(join(dir, "IBMPlexMono-SemiBold.ttf")),
    ]);
    fontCache = { fraunces, mono };
  }
  return fontCache;
}

export interface SocialCardInput {
  cover: Cover;
  title: string;
  /** e.g. "S1 · ACTIVE LARGE-SCALE LOSS", or a guide's kicker. */
  chip: string;
  /** Danger chips are filled red; everything else is a hairline outline. */
  chipDanger?: boolean;
}

/**
 * The plate is read off disk and inlined, not fetched over HTTP.
 *
 * These cards are prerendered at build time, when the deployment serving
 * them does not exist yet: pointing satori at the production origin gets
 * either a 404 or, worse, the *previous* deployment's picture. Both fail
 * silently and ship a card that is a black rectangle with good typography.
 */
async function plateDataUri(src: string) {
  const file = join(process.cwd(), "public", src.replace(/^\//, ""));
  const bytes = await readFile(file);
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export async function socialCard({
  cover,
  title,
  chip,
  chipDanger,
}: SocialCardInput) {
  const [{ fraunces, mono }, plateSrc] = await Promise.all([
    fonts(),
    plateDataUri(cover.src),
  ]);
  const plateNo = String(cover.plate.no).padStart(2, "0");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
        }}
      >
        <img
          src={plateSrc}
          width={SOCIAL_CARD_SIZE.width}
          height={SOCIAL_CARD_SIZE.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: cover.focal,
          }}
        />
        {/* The scrim has to carry a headline over whatever the painting is
            doing underneath — Bruegel's white winter sky included. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(14,14,12,0.05) 30%, rgba(14,14,12,0.92) 84%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            display: "flex",
            fontFamily: "Plex",
            fontSize: 18,
            letterSpacing: "0.05em",
            color: PAPER,
            background: chipDanger ? DANGER : "transparent",
            border: chipDanger ? `1px solid ${DANGER}` : "1px solid rgba(252,251,249,0.55)",
            padding: "6px 14px",
          }}
        >
          {chip}
        </div>

        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 40,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Plex",
              fontSize: 19,
              letterSpacing: "0.06em",
              color: ORANGE,
            }}
          >
            BTCSCAM · THE ANTI-SCAM PAPER OF RECORD
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: title.length > 96 ? 42 : 50,
              lineHeight: 1.16,
              color: PAPER,
              marginTop: 14,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Plex",
              fontSize: 17,
              letterSpacing: "0.05em",
              color: "rgba(252,251,249,0.62)",
              marginTop: 18,
            }}
          >
            {`PLATE No. ${plateNo} — ${cover.credit.toUpperCase()}`}
          </div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_CARD_SIZE,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 600 },
        { name: "Plex", data: mono, style: "normal", weight: 600 },
      ],
    },
  );
}
