/**
 * THE ASSIGNMENT LEDGER
 *
 * plates.ts is the archive: which paintings the desk holds. This file is the
 * assignment: which story gets which plate, and why.
 *
 * The "why" is not decoration. Lapham's Quarterly's rule for pairing art with
 * text is that the two should not illustrate each other but speak to each
 * other, and the allegory line is where that conversation is made explicit —
 * one sentence naming what the painting saw and what the scam does. It is the
 * only part of a cover a human must write; everything else is looked up.
 *
 * Coverage is guaranteed rather than hoped for: any story without an explicit
 * assignment falls back to its category's default plate, so a case file filed
 * at 2 a.m. still leads with a picture that argues something true. Writing an
 * explicit assignment is always better — the default argues about the
 * category, not about the story.
 *
 * Keys are incident slugs, or "guide:<slug>" for field guides.
 */
import {
  PLATES,
  plateCredit,
  plateSource,
  type Plate,
  type PlateKey,
} from "./plates.ts";

export interface Assignment {
  plate: PlateKey;
  /**
   * One sentence: what the painting saw, and what this scam does. Rendered in
   * mono caps under the plate, so it wants to be short enough to read as a
   * caption and sharp enough to be worth the space. Written as prose, no
   * trailing period needed.
   */
  allegory: string;
}

const ASSIGNMENTS: Record<string, Assignment> = {
  // ── Case files ──
  "coldcard-rng-seed-entropy-flaw-2026": {
    plate: "conjurer",
    allegory:
      "The crowd watches the cups while the purse is cut behind them. The device palmed your randomness while you watched the screen",
  },
  "coldcard-hardware-audit-phishing-2026": {
    plate: "big-fish",
    allegory:
      "Every fish in the picture has swallowed a smaller one. A breach becomes a mailing list becomes a phishing wave",
  },
  "milk-sad-libbitcoin-explorer-weak-entropy": {
    plate: "babel",
    allegory:
      "A tower raised by thousands of hands on a foundation nobody checked. Every key it built rested on a number small enough to guess",
  },
  "hashflare-cloud-mining-fraud": {
    plate: "alchemist",
    allegory:
      "Impressive apparatus, run in earnest, that was never going to produce gold. The mining power was sold; it did not exist",
  },
  "bitconnect-ponzi": {
    plate: "wagon-of-fools",
    allegory:
      "Weavers left their looms to follow a wagon rolling toward the sea. The stage show is load-bearing; the returns are not",
  },
  "mirror-trading-international": {
    plate: "icarus",
    allegory:
      "The promised flight ends as two legs vanishing into the water, and the ploughman never looks up. Twenty-three thousand bitcoin, and the market did not blink",
  },
  "task-job-deposit-scams": {
    plate: "sisyphus",
    allegory:
      "The boulder always rolls back, and the labour begins again. Every completed task set resets the count and the next deposit is due",
  },
  "ledger-impersonation-ecosystem": {
    plate: "misanthrope",
    allegory:
      "A man withdraws from the world for safety and is robbed inside the sphere he trusted. Holding your own coins was the right instinct; the letter in the post was not from Ledger",
  },
  "twitter-2020-giveaway-hack": {
    plate: "blind",
    allegory:
      "The leaders are in the ditch and the line is still walking. The accounts were genuine, and the blue ticks did the persuading",
  },
  "bitcoin-atm-impersonation-shakedowns": {
    plate: "tax-collectors",
    allegory:
      "Authority is a costume and a ledger held open until you pay. No agency has ever asked to be paid at a bitcoin machine",
  },
  "coinbase-insider-breach-2025": {
    plate: "judas",
    allegory:
      "Trusted access was sold, and the silver is on the floor. Support contractors were bribed for the customer data used against you",
  },
  "celsius-collapse": {
    plate: "bird-trap",
    allegory:
      "The skaters play on and the trap sits propped in the foreground. The yield account was not a deposit; it was an unsecured loan to the house",
  },
  "trezor-support-phishing": {
    plate: "fortune-teller-caravaggio",
    allegory:
      "She holds his gaze and his hand while the ring leaves his finger. He is smiling. The call felt like being helped right up until the seed phrase left his mouth",
  },
  "crypto-recovery-service-scams": {
    plate: "cutting-the-stone",
    allegory:
      "The surgeon cuts for a fee and draws out a flower; nothing was ever in there. The second scam is sold to the person the first one already emptied",
  },
  "bitcoin-sextortion-emails": {
    plate: "sleep-of-reason",
    allegory:
      "The monsters are produced by the sleep, and they go when the head lifts. The sender has an old leaked password and nothing else — no footage, no access, no camera",
  },

  // ── Field guides ──
  "guide:seed-phrase-entropy": {
    plate: "sower",
    allegory:
      "Seed cast by a practised hand, in a rhythm the sower can account for. Fifty dice rolls you performed beat any number a device hands you",
  },
  "guide:seed-phrase-storage": {
    plate: "balance",
    allegory:
      "She tests the empty balance before she trusts it with the gold. Verify the backup while nothing depends on it",
  },
  "guide:hardware-wallet-authenticity": {
    plate: "goldsmith",
    allegory:
      "Weighed at the counter before the sale closes, with a mirror on the street outside. Buy from the maker and check the device before it holds anything",
  },
  "guide:wallet-phishing-recognition": {
    plate: "cardsharps",
    allegory:
      "The signalling glove and the hidden card are both in frame; the mark is looking at his own hand. Recognition is a trained skill, and the tells repeat",
  },
  "guide:crypto-recovery-scams": {
    plate: "quack",
    allegory:
      "A stage, a remedy, and a crowd that needs one. What actually helps is unglamorous, free, and slow",
  },
};

/**
 * Fallbacks by scam category, used when a story has no explicit assignment.
 * Deliberately distinct from every plate assigned above: a reader should
 * never meet the same painting twice in one sitting and assume the desk ran
 * out of ideas.
 */
const CATEGORY_DEFAULTS: Record<string, { plate: PlateKey; allegory: string }> = {
  ponzi: {
    plate: "wagon-of-fools",
    allegory:
      "A festival wagon rolling toward the sea, and a crowd that left work to follow it",
  },
  impersonation: {
    plate: "isaac-jacob",
    allegory:
      "Borrowed login details pass a hands-on identity check because trust stood in for checking",
  },
  phishing: {
    plate: "fishing-for-souls",
    allegory: "Nets cast for the credulous, who swim toward the boats themselves",
  },
  "social-engineering": {
    plate: "fortune-teller-latour",
    allegory:
      "A story good enough to hold the attention while other hands do the work",
  },
  theft: {
    plate: "misanthrope",
    allegory:
      "A hand inside the trusted sphere, cutting a purse its owner is not watching",
  },
  vulnerability: {
    plate: "icarus",
    allegory:
      "One material flaw fails in production, in the corner of the frame, while everyone works on",
  },
  "exchange-failure": {
    plate: "cleansing-the-temple",
    allegory:
      "The house of exchange upended in an afternoon, deposits scattering across the floor",
  },
  "recovery-scam": {
    plate: "charlatan",
    allegory:
      "A remedy sold from a stage to an audience in masks, for a wound somebody else inflicted",
  },
  malware: {
    plate: "trojan-horse",
    allegory:
      "The thing that ruins them comes through the wall by invitation, hauled in by its own victims",
  },
  "fake-device": {
    plate: "goldsmith",
    allegory: "Test it at the counter before you trust it, and watch the street in the mirror",
  },
};

/** Last resort when a story has no assignment and no known category. The
 *  Babel panel argues the registry's whole thesis, so it is never wrong —
 *  only less specific than it should be. */
const HOUSE_DEFAULT: { plate: PlateKey; allegory: string } = {
  plate: "babel",
  allegory: "Built higher than it was ever checked, by thousands of hands, on sand",
};

export interface Cover {
  plate: Plate;
  /** e.g. "/covers/conjurer.jpg" */
  src: string;
  alt: string;
  /** "BOSCH, THE FORTUNE TELLER (C. 1595–98)" — caller uppercases. */
  credit: string;
  /** Holding institution, printed after the credit. */
  collection: string;
  /** Commons record for the reproduction. */
  source: string;
  /** CSS object-position for cropped surfaces. */
  focal: string;
  allegory: string;
  /** True when this came from a category fallback rather than a written
   *  assignment — surfaced in the editorial checklist, never to readers. */
  isDefault: boolean;
}

function build(
  entry: { plate: PlateKey; allegory: string },
  isDefault: boolean,
): Cover {
  const plate = PLATES[entry.plate];
  return {
    plate,
    src: `/covers/${plate.file}.jpg`,
    alt: plate.alt,
    credit: plateCredit(plate),
    collection: plate.collection,
    source: plateSource(plate),
    focal: plate.focal,
    allegory: entry.allegory,
    isDefault,
  };
}

/**
 * Resolve the cover for a story. Pass the story's categories so an unassigned
 * case file still gets a plate that argues about the right kind of scam.
 *
 * Always returns a cover — a story on this site is never published bare.
 */
export function coverFor(key: string, categories: string[] = []): Cover {
  const assigned = ASSIGNMENTS[key];
  if (assigned) return build(assigned, false);

  for (const category of categories) {
    const fallback = CATEGORY_DEFAULTS[category];
    if (fallback) return build(fallback, true);
  }
  return build(HOUSE_DEFAULT, true);
}

/** Stories with a written assignment — used by the plate audit in tests to
 *  catch a case file that shipped on a fallback nobody meant to keep. */
export function assignedKeys(): string[] {
  return Object.keys(ASSIGNMENTS);
}
