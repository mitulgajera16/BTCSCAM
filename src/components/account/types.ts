/**
 * Account-shared types and ladder copy. No Node imports — client components
 * consume this file.
 *
 * The ladder is a record of earned status, not a game: thresholds from
 * R3-PLAN, no points, no tokens, nothing purchasable. Votes and chips are
 * signals to the editors — nothing here auto-verifies an incident.
 */

/** The shared action-result shape, aliased so account code reads local. */
export type AccountActionResult = import("@/components/ui").ActionResult;

export type LadderRole =
  | "reader"
  | "reporter"
  | "corroborator"
  | "watchman"
  | "mod";

export const ROLE_RANK: Record<LadderRole, number> = {
  reader: 0,
  reporter: 1,
  corroborator: 2,
  watchman: 3,
  mod: 4,
};

export type LadderTier = {
  role: LadderRole;
  title: string;
  earned: string;
  grants: string;
  /** True when the tier is granted by hand — thresholds alone never reach it. */
  manual?: boolean;
};

/**
 * Thresholds are editorial law (R3-PLAN). Promotion is checked by the desk —
 * never automatic demotion, never auto-verification.
 *
 * THE single source for the ladder: the account LadderTable, the open
 * reports page's LadderBox, and the desk LadderPanel all render from this
 * array.
 * Grants describe only what exists in shipped code — no promised tools.
 */
export const LADDER_TIERS: LadderTier[] = [
  {
    role: "reader",
    title: "READER",
    earned: "Sign in with your email. That is all.",
    grants:
      "A named record: your reports and evidence tracked in one place, under one handle.",
  },
  {
    role: "reporter",
    title: "REPORTER",
    earned: "1 report accepted by the desk.",
    grants: "Named credit available on work the desk accepts.",
  },
  {
    role: "corroborator",
    title: "WITNESS",
    earned:
      "3 accepted reports — or 5 accepted evidence chips on other people's reports.",
    grants:
      "Back up or dispute open reports. What you file is a signal to the editors, never a verdict.",
  },
  {
    role: "watchman",
    title: "WATCHMAN",
    earned: "10 accepted contributions, plus editor approval.",
    grants:
      "Senior standing on the record, granted by the editors. Status and credit — rank never adds power over the record.",
    manual: true,
  },
  {
    role: "mod",
    title: "MOD",
    earned: "Appointed by the editors. Never automatic.",
    grants: "The desk itself: review, publish, correct — on the record.",
    manual: true,
  },
];
