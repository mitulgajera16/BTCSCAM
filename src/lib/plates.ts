/**
 * THE PICTURE ARCHIVE
 *
 * Every story on this site leads with a public-domain old-master painting
 * whose subject rhymes with the scam. The argument is that none of this is
 * new: Bosch painted the cups-and-balls con in 1502, and the only thing that
 * has changed is that the purse is now a seed phrase.
 *
 * This file is the archive — one entry per PAINTING, numbered in the order it
 * entered the collection. Plate numbers are permanent: once assigned, a
 * number belongs to that painting forever, so a reader who sees "PLATE No. 7"
 * twice is seeing the same picture twice. Which story uses which plate is a
 * separate question, answered in covers.ts.
 *
 * Every plate must clear the intake standards in docs/design/cover-doctrine.md
 * — most importantly, the reproduction must be the painting alone. A museum
 * scan that includes the gilded frame, the gallery wall, or a brass label is
 * not a plate; either trim it with `sourceCrop` or find a flat scan.
 *
 * Assets are produced by `node scripts/fetch-plates.mjs`, which fetches from
 * Commons and bakes the house grade into the file. Do not hand-edit
 * public/covers.
 */

export interface Plate {
  /** Permanent accession number. Never reassign or reuse. */
  no: number;
  /** Basename in /public/covers (no extension). */
  file: string;
  /**
   * True pixel size of the graded file. Kept in the registry because next/image
   * needs the real aspect ratio to reserve space (a portrait plate declared as
   * landscape jumps the page as it loads), and because the case file lead uses it
   * to cap tall plates. `npm test` checks these against the files on disk.
   */
  width: number;
  height: number;
  painting: string;
  /** Surname-first display form for the credit line, e.g. "BOSCH". */
  artist: string;
  /** Display form, e.g. "c. 1502" — printed as given. */
  year: string;
  /** Holding institution, for the credit line. */
  collection: string;
  /** Wikimedia Commons File: name — the pipeline's fetch key. */
  commonsFile: string;
  /** Rights of the reproduction, not the painting (which is PD by age). */
  rights: string;
  /**
   * Trims junk baked into the source scan — frame, wall, label — as
   * percentages of the source: "left,top,width,height".
   */
  sourceCrop?: string;
  /**
   * Where the picture's argument lives, as a CSS object-position. Small
   * surfaces crop to this point, so a square thumbnail still shows the con
   * rather than an anonymous patch of sky.
   */
  focal: string;
  /** Describes the painting for readers who cannot see it. */
  alt: string;
  /**
   * The forensic detail — the palmed coin, the cut purse. Optional: a plate
   * without one still renders a full caption. When present, the case file
   * shows a magnified inset beside the credit line.
   */
  tell?: {
    /** object-position of the detail within the painting. */
    focal: string;
    /** Magnification. 2.5–4 is the useful range. */
    zoom: number;
  };
}

export const PLATES = {
  // ── Plates 1–4: the founding collection, published with the v4 design ──
  conjurer: {
    no: 1,
    file: "conjurer",
    width: 1600,
    height: 1330,
    painting: "The Conjurer",
    artist: "Bosch",
    year: "c. 1502",
    collection: "Musée Municipal, Saint-Germain-en-Laye",
    commonsFile: "File:Hieronymus Bosch 051.jpg",
    rights: "PD-Art",
    focal: "72% 46%",
    alt: "A cups-and-balls conjurer performs for a crowd of onlookers while, behind them, a man in a dark hood cuts the purse of a bent-over spectator who is absorbed in the trick.",
    tell: { focal: "24% 45%", zoom: 2.6 },
  },
  "big-fish": {
    no: 2,
    file: "big-fish",
    width: 1600,
    height: 1222,
    painting: "Big Fish Eat Little Fish",
    artist: "after Bruegel",
    year: "1557",
    collection: "engraving by Pieter van der Heyden",
    commonsFile: "File:Big Fish Eat Little Fish MET DP825754.jpg",
    rights: "CC0 · Met Open Access",
    focal: "38% 46%",
    alt: "An engraving of a beached giant fish being cut open, spilling dozens of smaller fish from its belly, each of which has itself swallowed a smaller fish.",
  },
  babel: {
    no: 3,
    file: "babel",
    width: 1600,
    height: 1171,
    painting: "The Tower of Babel",
    artist: "Bruegel the Elder",
    year: "1563",
    collection: "Kunsthistorisches Museum, Vienna",
    commonsFile:
      "File:Pieter Bruegel the Elder - The Tower of Babel (Vienna) - Google Art Project - edited.jpg",
    rights: "PD-Art",
    focal: "52% 40%",
    alt: "An enormous spiralling tower under construction, swarming with tiny labourers, its upper storeys rising into cloud while the lower arches already sag and crack.",
  },
  sower: {
    no: 4,
    file: "sower",
    width: 1600,
    height: 1970,
    painting: "The Sower",
    artist: "Millet",
    year: "1850",
    collection: "Museum of Fine Arts, Boston",
    commonsFile: "File:Jean-François Millet - The Sower - Google Art Project.jpg",
    rights: "PD-Art",
    focal: "50% 45%",
    alt: "A labourer strides down a ploughed hillside at dusk, casting seed from a bag at his hip in a wide practised arc.",
  },

  // ── Plates 5–20: the 2026 acquisition, one per outstanding story ──
  alchemist: {
    no: 5,
    file: "alchemist",
    width: 1600,
    height: 1183,
    painting: "The Alchemist",
    artist: "Teniers the Younger",
    year: "c. 1650",
    collection: "Mauritshuis, The Hague",
    commonsFile: "File:David Teniers de Jonge - The Alchemist - 261 - Mauritshuis.jpg",
    rights: "PD-Art",
    focal: "38% 52%",
    alt: "An alchemist works a furnace bellows in a cluttered workshop of retorts, crucibles and glass vessels, surrounded by apparatus that will never produce gold.",
  },
  "wagon-of-fools": {
    no: 6,
    file: "wagon-of-fools",
    width: 1600,
    height: 1167,
    painting: "Flora's Wagon of Fools",
    artist: "Pot",
    year: "c. 1637",
    collection: "Frans Hals Museum, Haarlem",
    commonsFile:
      "File:Flora's Wagon of Fools (Flora's Mallewagen) tulipomania, Hendrik Gerritsz Pot c1637.jpg",
    rights: "PD-Art",
    focal: "42% 50%",
    alt: "A sailing wagon carrying Flora and her tulips rolls toward the sea, trailed on foot by a crowd of weavers who have abandoned their looms to follow it.",
  },
  icarus: {
    no: 7,
    file: "icarus",
    width: 1600,
    height: 1044,
    painting: "Landscape with the Fall of Icarus",
    artist: "after Bruegel the Elder",
    year: "c. 1560s",
    collection: "Royal Museums of Fine Arts of Belgium, Brussels",
    commonsFile:
      "File:Pieter Bruegel the Elder - Landscape with the Fall of Icarus - Brussels, Royal Museums of Fine Arts of Belgium - Google Arts & Culture.jpg",
    rights: "PD-Art",
    // Biased right so the splash survives the crop — without it the picture
    // is just a pleasant afternoon of ploughing.
    focal: "68% 58%",
    alt: "A ploughman works a coastal field in afternoon light while, unnoticed in the lower corner of the picture, two pale legs disappear into the sea below a passing ship.",
    tell: { focal: "80% 88%", zoom: 3.6 },
  },
  sisyphus: {
    no: 8,
    file: "sisyphus",
    width: 1600,
    height: 1816,
    painting: "Sisyphus",
    artist: "Titian",
    year: "1548–49",
    collection: "Museo del Prado, Madrid",
    commonsFile: "File:Punishment sisyph.jpg",
    rights: "PD-Art",
    focal: "50% 36%",
    alt: "A straining figure carries an enormous boulder up a dark slope, his whole body bent under a weight that will roll back down the moment he stops.",
  },
  misanthrope: {
    no: 9,
    file: "misanthrope",
    width: 1600,
    height: 1580,
    painting: "The Misanthrope",
    artist: "Bruegel the Elder",
    year: "1568",
    collection: "Museo di Capodimonte, Naples",
    commonsFile: "File:Pieter Bruegel d. Ä. 035.jpg",
    rights: "PD-Art",
    focal: "50% 50%",
    alt: "A hooded man walks away from the world in a black cloak while, crouched inside a glass orb at his side, a thief cuts the strings of his heart-shaped red purse.",
    tell: { focal: "68% 58%", zoom: 2.8 },
  },
  blind: {
    no: 10,
    file: "blind",
    width: 1600,
    height: 888,
    painting: "The Parable of the Blind",
    artist: "Bruegel the Elder",
    year: "1568",
    collection: "Museo di Capodimonte, Naples",
    commonsFile: "File:Pieter Bruegel the Elder (1568) The Blind Leading the Blind.jpg",
    rights: "PD-Art",
    focal: "58% 44%",
    alt: "Six blind men walk in a line with hands on each other's shoulders; the leader has already fallen backwards into a ditch and the next is tipping after him.",
    tell: { focal: "83% 70%", zoom: 2.6 },
  },
  "tax-collectors": {
    no: 11,
    file: "tax-collectors",
    width: 1600,
    height: 1984,
    painting: "The Tax Collectors",
    artist: "van Reymerswaele",
    year: "c. 1540",
    collection: "National Museum in Warsaw",
    commonsFile:
      "File:Marinus Claeszoon van Reymerswaele - Tax collectors - M.Ob.592 MNW - National Museum in Warsaw.jpg",
    rights: "PD-Art",
    focal: "50% 32%",
    alt: "Two grimacing officials in elaborate costume lean over an open ledger, one pointing at an entry while the other writes, coins stacked on the table between them.",
  },
  judas: {
    no: 12,
    file: "judas",
    width: 1600,
    height: 1236,
    painting: "Judas Returning the Thirty Pieces of Silver",
    artist: "Rembrandt",
    year: "1629",
    collection: "private collection",
    commonsFile: "File:Judas returning the thirty pieces of silver, by Rembrandt.jpg",
    rights: "PD-Art",
    focal: "56% 56%",
    alt: "A man kneels wringing his hands before robed priests who turn away from him; the silver he was paid lies scattered across the floor at his knees.",
    // No tell: the scattered silver lies in shadow deep enough that every
    // magnification of it reads as a smudge rather than as evidence. The
    // caption carries the allegory instead — which is what the optional
    // field is for.
  },
  "bird-trap": {
    no: 13,
    file: "bird-trap",
    width: 1600,
    height: 1061,
    painting: "Winter Landscape with Skaters and a Bird Trap",
    artist: "Bruegel the Elder",
    year: "1565",
    collection: "Royal Museums of Fine Arts of Belgium, Brussels",
    commonsFile:
      "File:Bruegel, Pieter (I) - Winterlandschap met schaatsers en vogelknip, 1565.jpg",
    rights: "PD-Art",
    focal: "44% 52%",
    alt: "Villagers skate and play on a frozen river in flat winter light while, propped on a stick in the foreground, a heavy door waits over scattered bait for the birds feeding beneath it.",
    tell: { focal: "90% 73%", zoom: 3.0 },
  },
  goldsmith: {
    no: 14,
    file: "goldsmith",
    width: 1600,
    height: 1839,
    painting: "A Goldsmith in His Shop",
    artist: "Petrus Christus",
    year: "1449",
    collection: "The Metropolitan Museum of Art, New York",
    // NOT MET DP266944 — that file is an X-radiograph composite of this
    // panel, tiled in black and white with a calibration strip.
    commonsFile: "File:A Goldsmith in his Shop MET DT711.jpg",
    rights: "CC0 · Met Open Access",
    focal: "50% 46%",
    alt: "A goldsmith at his counter weighs a ring on a hand balance for a couple buying it, his shelves stocked with raw materials, a convex mirror at the edge of the table showing the street outside.",
    tell: { focal: "90% 66%", zoom: 3.2 },
  },
  cardsharps: {
    no: 15,
    file: "cardsharps",
    width: 1600,
    height: 1151,
    painting: "The Cardsharps",
    artist: "Caravaggio",
    year: "c. 1594",
    collection: "Kimbell Art Museum, Fort Worth",
    commonsFile:
      "File:Caravaggio (Michelangelo Merisi) - The Cardsharps - Google Art Project.jpg",
    rights: "PD-Art",
    focal: "50% 48%",
    alt: "A young man studies his cards while an older accomplice looks over his shoulder and signals with gloved fingers to a second cheat, who is drawing a hidden card from behind his back.",
    tell: { focal: "46% 40%", zoom: 2.8 },
  },
  balance: {
    no: 16,
    file: "balance",
    width: 1600,
    height: 1809,
    painting: "Woman Holding a Balance",
    artist: "Vermeer",
    year: "c. 1663",
    collection: "National Gallery of Art, Washington",
    commonsFile:
      "File:Johannes Vermeer - Woman Holding a Balance - Google Art Project.jpg",
    rights: "PD-Art",
    focal: "50% 46%",
    alt: "In a quiet room lit from a high window, a woman holds an empty balance perfectly still, testing it before the pearls and gold coins laid out on the table beside her.",
    tell: { focal: "57% 47%", zoom: 3.2 },
  },
  quack: {
    no: 17,
    file: "quack",
    width: 1600,
    height: 1168,
    painting: "The Quack",
    artist: "Jan Steen",
    year: "c. 1650–60",
    collection: "Rijksmuseum, Amsterdam",
    commonsFile: "File:Jan Steen - De kwakzalver.jpg",
    rights: "PD-Art",
    focal: "42% 48%",
    alt: "A mountebank stands raised on a makeshift stage holding up his remedy to a crowd of upturned faces, his table of bottles and instruments beside him.",
  },
  "fishing-for-souls": {
    no: 18,
    file: "fishing-for-souls",
    width: 1600,
    height: 845,
    painting: "Fishing for Souls",
    artist: "van de Venne",
    year: "1614",
    collection: "Rijksmuseum, Amsterdam",
    commonsFile:
      "File:De zielenvisserij - Fishing for souls (Adriaen Pietersz. van de Venne).jpg",
    rights: "PD-Art",
    focal: "50% 52%",
    alt: "Rival boat crews haul nets full of people from a wide river, while crowds line both banks and more swimmers strike out toward the boats of their own accord.",
  },
  "isaac-jacob": {
    no: 19,
    file: "isaac-jacob",
    width: 1600,
    height: 1320,
    painting: "Isaac Blessing Jacob",
    artist: "Flinck",
    year: "1638",
    collection: "Rijksmuseum, Amsterdam",
    commonsFile: "File:Isaak zegent Jakob Rijksmuseum SK-A-110.jpeg",
    rights: "PD-Art",
    focal: "50% 48%",
    alt: "A blind old man in bed reaches out to feel the arm of the son kneeling before him, who is wearing borrowed goatskins to pass for his brother; a woman watches from the shadows.",
    tell: { focal: "52% 56%", zoom: 2.8 },
  },
  "cleansing-the-temple": {
    no: 20,
    file: "cleansing-the-temple",
    width: 1600,
    height: 1244,
    painting: "Christ Cleansing the Temple",
    artist: "El Greco",
    year: "before 1570",
    collection: "National Gallery of Art, Washington",
    commonsFile:
      "File:El Greco (Domenikos Theotokopoulos), Christ Cleansing the Temple, probably before 1570, NGA 43723.jpg",
    rights: "CC0 · NGA Open Access",
    focal: "50% 50%",
    alt: "A figure with a raised whip drives money-changers from a temple, their tables overturned and coins scattering as the traders scramble for the door.",
  },
  "trojan-horse": {
    no: 21,
    file: "trojan-horse",
    width: 1600,
    height: 933,
    painting: "The Procession of the Trojan Horse in Troy",
    artist: "G. D. Tiepolo",
    year: "c. 1760",
    collection: "The National Gallery, London",
    commonsFile:
      "File:Giovanni Domenico Tiepolo - The Procession of the Trojan Horse in Troy - WGA22382.jpg",
    rights: "PD-Art",
    focal: "56% 46%",
    alt: "A crowd hauls an enormous wooden horse through a breach in their own city wall by ropes, garlanded and celebrating as it comes.",
  },
  // Two plates in this archive are titled "The Fortune Teller" and two are by
  // Caravaggio. That is not an accident of sloppy picking — these are the
  // period's canonical con pictures — but it obliges the credit line to carry
  // artist AND collection, never the title alone, or a reader moving between
  // case files will think one plate is being reused.
  "fortune-teller-latour": {
    no: 23,
    file: "fortune-teller-latour",
    width: 1600,
    height: 1323,
    painting: "The Fortune Teller",
    artist: "de La Tour",
    year: "c. 1630s",
    collection: "The Metropolitan Museum of Art, New York",
    commonsFile:
      "File:Georges de La Tour (French, Vic-sur-Seille 1593–1653 Lunéville) - The Fortune Teller - Google Art Project.jpg",
    rights: "PD-Art",
    focal: "50% 38%",
    alt: "An old woman tells a young man's fortune while he watches her face; on either side of him, three accomplices quietly lift his purse and cut the gold medal from its chain.",
    tell: { focal: "32% 70%", zoom: 3.0 },
  },
  "fortune-teller-caravaggio": {
    no: 24,
    file: "fortune-teller-caravaggio",
    width: 1600,
    height: 1209,
    painting: "The Fortune Teller",
    artist: "Caravaggio",
    year: "c. 1595–98",
    collection: "Musée du Louvre, Paris",
    commonsFile: "File:The Fortune Teller-Caravaggio (Louvre).jpg",
    rights: "PD-Art",
    // The top third is empty lit wall; bias down so the hands survive.
    focal: "44% 62%",
    alt: "A smiling young gentleman holds out his palm to a woman reading it; she holds his gaze while her other hand quietly works the ring off his finger.",
    tell: { focal: "47% 75%", zoom: 3.0 },
  },
  "cutting-the-stone": {
    no: 25,
    file: "cutting-the-stone",
    width: 1600,
    height: 2288,
    painting: "The Extraction of the Stone of Madness",
    artist: "attributed to Bosch",
    year: "c. 1501–05",
    collection: "Museo del Prado, Madrid",
    commonsFile: "File:Cutting the Stone (Bosch).jpg",
    rights: "PD-Art",
    focal: "50% 44%",
    alt: "A surgeon wearing an inverted funnel for a hat cuts into a bound man's scalp and draws out a flower, watched by a friar holding a flask and a nun with a closed book balanced on her head.",
    tell: { focal: "30% 44%", zoom: 2.8 },
  },
  "sleep-of-reason": {
    no: 26,
    file: "sleep-of-reason",
    width: 1600,
    height: 2529,
    painting: "The Sleep of Reason Produces Monsters",
    artist: "Goya",
    year: "1799",
    collection: "National Gallery of Art, Washington",
    commonsFile:
      "File:Francisco de Goya, El sueño de la razon produce monstruos (The Sleep of Reason Produces Monsters), published 1799, NGA 7502.jpg",
    rights: "CC0 · NGA Open Access",
    // Trims the bare paper margin back to the platemark — untrimmed white
    // border reads as a printing mistake against warm newsprint.
    sourceCrop: "13,6,75,84",
    focal: "42% 55%",
    alt: "An etching of a man asleep over his writing desk while owls and bats swarm out of the darkness above him; the desk itself is inscribed with the title.",
    tell: { focal: "72% 63%", zoom: 2.8 },
  },
  charlatan: {
    no: 22,
    file: "charlatan",
    width: 1600,
    height: 2043,
    painting: "The Charlatan",
    artist: "Longhi",
    year: "1757",
    collection: "Ca' Rezzonico, Venice",
    commonsFile: "File:Ca' Rezzonico - Il Ciarlatano - Pietro Longhi.jpg",
    rights: "PD-Art",
    focal: "50% 40%",
    alt: "A mountebank on a raised carnival stage holds up a vial to a Venetian crowd, many of them watching from behind white carnival masks.",
  },
} as const satisfies Record<string, Plate>;

export type PlateKey = keyof typeof PLATES;

/** Credit line, second half: "BOSCH, THE CONJURER (C. 1502)". Rendered in
 *  mono caps, so the caller uppercases; this keeps the punctuation right. */
export function plateCredit(plate: Plate): string {
  return `${plate.artist}, ${plate.painting} (${plate.year})`;
}

/** Deep link to the reproduction's Commons record. The credit line links
 *  here: a publication that demands receipts from everyone else shows its
 *  own for the pictures it prints. */
export function plateSource(plate: Plate): string {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(
    plate.commonsFile.replace(/ /g, "_"),
  )}`;
}
