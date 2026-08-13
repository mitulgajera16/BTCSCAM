/**
 * SeverityChip — how bad a scam is, printed the same way everywhere.
 *
 * It used to be printed three different ways. The same S1 case rendered as
 * "CRITICAL" on the homepage, as "S1 · HAPPENING NOW · BIG LOSSES" on its
 * own case file, and as a bare "S1" inside a guide — one fact, three
 * labels, three hand-rolled chips. A reader who met the same scam twice
 * had no way to know it was the same scam.
 *
 * Every label here is sliced out of SEVERITY_LABEL, the one table in
 * src/lib/incidents.ts. There is no second list to keep in sync: change the
 * wording there and all three lengths change with it.
 *
 * Lengths, not meanings:
 *   full  — the whole label, for the case file that has room for it
 *   short — code + urgency ("S1 · HAPPENING NOW"), for lists
 *   code  — "S1", for the tightest sidebars, with the full text on hover
 *
 * Colour follows the fact, not the surface: S1 is filled red, S2 outlined
 * red, and S3/S4 are quiet — a scam that is over stops shouting, which the
 * old homepage chip never did.
 */
import { SEVERITY_LABEL, type Incident } from "@/lib/incidents";
import Chip, { type ChipTone } from "./chip";

type Severity = Incident["severity"];

const TONE: Record<Severity, ChipTone> = {
  S1: "dangerSolid",
  S2: "danger",
  S3: "muted",
  S4: "muted",
};

/** "S1 · HAPPENING NOW · BIG LOSSES" → ["S1", "HAPPENING NOW", "BIG LOSSES"] */
function parts(severity: Severity): string[] {
  return SEVERITY_LABEL[severity].split(" · ");
}

export default function SeverityChip({
  severity,
  length = "short",
}: {
  severity: Severity;
  length?: "full" | "short" | "code";
}) {
  const seg = parts(severity);
  const full = SEVERITY_LABEL[severity];
  const text =
    length === "full"
      ? full
      : length === "code"
        ? seg[0]
        : seg.slice(0, 2).join(" · ");

  return (
    <Chip tone={TONE[severity]} title={text === full ? undefined : full}>
      {text}
    </Chip>
  );
}
