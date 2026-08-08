/**
 * Story covers — the v4 design leads every story with public-domain
 * Renaissance/archive paintings ("PAINTING: RENAISSANCE ARCHIVE").
 * Files live in /public/covers (downloaded from Wikimedia Commons, PD-Art).
 * Each incident/guide maps to a painting whose subject rhymes with the story.
 */

export type Cover = {
  src: string;
  alt: string;
  credit: string;
};

const COVERS: Record<string, Cover> = {
  // Sleight-of-hand at the table — the RNG that palmed your entropy.
  "coldcard-rng-seed-entropy-flaw-2026": {
    src: "/covers/conjurer.jpg",
    alt: "The Conjurer by Hieronymus Bosch — a cups-and-balls trickster fleeces onlookers",
    credit: "PAINTING: BOSCH, THE CONJURER (C. 1502) · RENAISSANCE ARCHIVE",
  },
  // Predation at scale — phishing feeds on the already-frightened.
  "coldcard-hardware-audit-phishing-2026": {
    src: "/covers/big-fish.jpg",
    alt: "Big Fish Eat Little Fish, after Pieter Bruegel the Elder",
    credit: "ENGRAVING: AFTER BRUEGEL, BIG FISH EAT LITTLE FISH (1556) · RENAISSANCE ARCHIVE",
  },
  // A tower built on 32 bits of sand.
  "milk-sad-libbitcoin-explorer-weak-entropy": {
    src: "/covers/babel.jpg",
    alt: "The Tower of Babel by Pieter Bruegel the Elder",
    credit: "PAINTING: BRUEGEL, THE TOWER OF BABEL (1563) · RENAISSANCE ARCHIVE",
  },
  // Sowing seeds, properly.
  "guide:seed-phrase-entropy": {
    src: "/covers/sower.jpg",
    alt: "The Sower by Jean-François Millet",
    credit: "PAINTING: MILLET, THE SOWER (1850) · ARCHIVE",
  },
};

export function coverFor(key: string): Cover | null {
  return COVERS[key] ?? null;
}
