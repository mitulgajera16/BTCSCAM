import test from "node:test";
import assert from "node:assert/strict";
import { parseReviewFlags } from "../src/lib/registry/review-flags.ts";

const FIXTURE = `# Wave-1 Seed Dossiers — Review Queue

Intro table here.

---

## 1. First dossier headline

**File:** \`data/drafts/first-dossier.json\` · trustState \`verified\` · S1 · categories: impersonation

**Verifier's one-liner:** fine.

**Check before approving:**
- [ ] Confirm the statute from the official source before publish.
- [ ] Archive captures pending for two URLs.

---

## 2. Second dossier headline

**File:** \`data/drafts/second-dossier.json\` · trustState \`resolved\` · S4

No checklist section in this one.

---
`;

test("parses checklist items keyed by draft file name", () => {
  const flags = parseReviewFlags(FIXTURE);
  assert.deepEqual(flags.get("first-dossier.json"), [
    "Confirm the statute from the official source before publish.",
    "Archive captures pending for two URLs.",
  ]);
});

test("a case file section without a checklist maps to an empty list", () => {
  const flags = parseReviewFlags(FIXTURE);
  assert.deepEqual(flags.get("second-dossier.json"), []);
});

test("garbage input yields an empty map, never a throw", () => {
  assert.equal(parseReviewFlags("").size, 0);
  assert.equal(parseReviewFlags("# nothing relevant\n---\nplain text").size, 0);
});
