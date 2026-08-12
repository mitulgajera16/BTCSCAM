/**
 * Tolerant parser for docs/review/*-review.md. Convention (wave 1 sets it):
 * dossier sections are separated by --- rules, each carries a
 * **File:** `data/drafts/<name>.json` line and, usually, a
 * "**Check before approving:**" checkbox list. Anything that does not match
 * is skipped — a malformed review doc must never break the registry desk.
 */
export function parseReviewFlags(markdown: string): Map<string, string[]> {
  const flags = new Map<string, string[]>();
  for (const section of markdown.split(/\n---\n/)) {
    const fileMatch = section.match(/\*\*File:\*\*\s*`data\/drafts\/([^`]+)`/);
    if (!fileMatch) continue;
    const name = fileMatch[1];
    const checkIdx = section.indexOf("**Check before approving:**");
    if (checkIdx < 0) {
      flags.set(name, []);
      continue;
    }
    const items: string[] = [];
    for (const line of section.slice(checkIdx).split("\n")) {
      const m = line.match(/^\s*-\s*\[\s*[xX ]?\s*\]\s*(.+)$/);
      if (m) items.push(m[1].trim());
    }
    flags.set(name, items);
  }
  return flags;
}
