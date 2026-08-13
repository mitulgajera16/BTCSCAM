# Cover doctrine

How BTCSCAM picks, prepares, and prints the painting that leads a story.

## The argument

Every cover makes one claim: **none of this is new.** Bosch painted the
cups-and-balls con in 1502 and the only thing that has changed is that the
purse is now a seed phrase. A reader who arrives frightened and ashamed —
most of them do — should meet a picture that says people have been losing
money to exactly this trick for five hundred years, and the shame belongs to
the person running it.

That is why the covers are paintings and not stock photography of hooded
figures at keyboards. Stock photography says *you were careless.* A Bruegel
says *you were human, and so was everyone in this picture.*

The pairing is an argument, not a decoration. Lapham's Quarterly's rule is
that the art and the text should not illustrate each other but speak to each
other, and the **allegory line** under each plate is where that conversation
is said out loud. It is the only part of a cover a person has to write.

## The three files

| File | What it holds |
|---|---|
| `src/lib/plates.ts` | The archive: one entry per painting, numbered permanently |
| `src/lib/covers.ts` | The assignment: which story gets which plate, and the allegory line |
| `scripts/fetch-plates.mjs` | Intake: fetch from Commons, trim, grade, optimize |

Plate numbers belong to the **painting**, not the story. Two case files leading
with the same picture show the same number, which is the point. Never
reassign a number; assign the next free one.

## Adding a cover to a new story

1. **Look for the rhyme, not the subject.** The painting should share the
   scam's *mechanism*, not its props. A story about a fake hardware wallet is
   not about wallets, it is about verifying an object before you trust it —
   which is a goldsmith weighing a ring at his counter in 1449.
2. **Check the archive first.** Reuse is fine and cheaper than acquisition,
   as long as the allegory line argues freshly.
3. **Verify on Commons before writing anything down.** The file must exist,
   the original must be at least 1600px on its long edge, and the licence
   must be PD-Art, PD-old, or CC0. Record the exact `File:` name.
4. **Add the plate** to `plates.ts` with the next free number, then run
   `npm run plates` to fetch it.
5. **Add the assignment** to `covers.ts` with an allegory line.
6. **Run `npm test`.** The picture desk's checks will tell you if the image
   never landed, if a number collides, or if a story is quietly running on a
   category fallback.

> **After re-fetching an existing plate, delete `.next/cache/images`.** Next's
> image optimizer caches by URL and does not notice that the file underneath
> changed, so the site will keep serving the old picture through a rebuild —
> which is how a set of accidentally-greyscale plates survived three rebuilds
> and two screenshots before anyone noticed.

## Intake standards

A reproduction is a plate only if:

- **It is the painting alone.** No gilded frame, no gallery wall, no brass
  label, no visitor's shoulder. Museum wall photographs are common on Commons
  and are not usable — the Warsaw *Tax Collectors* was chosen over a
  frame-and-wall scan of the same subject for exactly this reason. Where a
  good scan carries a paper margin (prints usually do), trim it with
  `sourceCrop` rather than shipping it.
- **It clears 1600px** on its long edge at source.
- **Its licence is recorded**, and the credit line links to the Commons
  record. A publication that demands receipts from everyone else shows its
  own.

## Tone

These pages are read by people in the worst week of their financial lives,
sometimes at four in the morning.

- **Dignified allegory, never meme.** No monkeys trading tulips, however apt.
- **No gore, no nudity, no lurid framing.** This is not squeamishness; a
  sextortion case file illustrated with a woman flung across a bed supplies
  exactly the frame the scam is selling, and humiliates the reader it exists
  to calm.
- **Never blame the victim.** A painting whose subject is being punished for
  their own greed argues the scammer's case. This is why Bosch's *Death and
  the Miser* was rejected for the sextortion case file and Goya's *Sleep of
  Reason* chosen instead: in the Bosch the threat is real and deserved, and
  the whole point of that case file is that the sender has nothing.
- **Match the picture to the verdict.** If the story says the threat is
  empty, the picture must not say the threat is real.

## The treatment

Four decisions, each settled by printing comps and looking at them rather
than by argument. All four are load-bearing; changing one alone will look
worse, not different.

**The whole painting leads the case file.** The argument needs the whole
picture. Cropping the Bosch to a dramatic 21:9 band looked better in
isolation and made the claim weaker. The one limit is a 72vh cap: a portrait
panel at full height runs past 1000px in the story column and buries the
summary, which is the part a frightened reader actually came for. Past the
cap the plate crops to its focal point, so what survives is the part that
carries the argument.

**Small surfaces crop to the focal point.** Cohesion across a shelf of
thumbnails comes from consistent framing, not from a filter. Every plate
carries a `focal` for this; without one a square Bruegel thumbnail is a patch
of sky.

**One hairline ink rule, always.** A 1px ink border on every plate at every
size. Light paintings otherwise bleed into the warm paper and the line
engraving loses its edge entirely. (recent.design's card system reaches for
the same device for the same reason.)

**The whisper grade, baked into the file.** Saturation to 0.94, a slight warm
per-channel cast. Just enough to put a 1557 engraving and a 1663 Vermeer in
the same air; not enough to touch the vermilion that makes people stop
scrolling. It is baked in by the intake script rather than applied in CSS
because the social-card renderer cannot run CSS filters, and the picture in a
link unfurl must be the same picture as on the page.

> **Never use sharp's `tint()` for the warm cast.** It maps the image through
> its lightness channel and returns a duotone. It shipped every oil painting
> in black and white once already. The pipeline now measures colour spread
> after grading and warns if a plate comes out near-greyscale.

### Type never sits on paint

Captions live on paper, below the plate. The two exceptions are the
front-page hero and the social card, and only because a lead image with no
headline is not a lead. Both carry a scrim that ramps early enough to hold
the small orange kicker, which is the first thing to disappear over mid-tone
paint.

### The tell

Where the desk has marked one, the case file prints a magnified square of the
detail that gives the con away — the cutpurse's hand, the ring leaving the
finger — beside the credit line, and the caption switches from
`THE ALLEGORY:` to `THE TELL:`.

This is the move that makes the page a registry rather than a gallery: it
does not just show you a painting about deception, it points at the deception
inside the painting. It is optional by design. A plate without `tell`
coordinates still prints a full caption, so no story is ever blocked on
having one — but a wrong `tell` is worse than none, because a magnified
smudge of nothing reads as a mistake. Check the inset before you ship it.

## Coverage

`coverFor()` always returns a cover. A story with no written assignment falls
back to its category's default plate, and a story with no known category
falls back to the Tower of Babel, which argues the registry's thesis and so
is never wrong — only less specific than it should be.

Fallbacks exist so a case file filed at 2 a.m. still leads with a picture that
argues something true. They are not a resting state: `npm test` fails when a
published case file or live guide has no written assignment.
