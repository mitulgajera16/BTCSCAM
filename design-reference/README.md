# Design Reference — exported from Claude Design

Source project: **BTC Scam Awareness Portal** (claude.ai project `1298c3b9-2f23-4205-a4eb-1f2fd9905c47`), exported 2026-08-08.

| File | Status | Notes |
|---|---|---|
| `BTCSCAM Portal v4.dc.html` | ✅ complete (255 KB) | **Canonical source.** Single-file SPA, ~26 screens. All markup, CSS tokens, and app JS live inside `<x-dc>` → `<script data-dc-script>`. |
| `support.js` | ✅ complete | Claude Design runtime (`dc-runtime`). Parses the `.dc.html`, mounts it with React. Reference only — not used in the Next.js build. |
| `BTCSCAM Portal v4.html.TRUNCATED-at-256KB` | ⚠️ truncated | Bundled standalone export; hit the 256 KiB API export cap mid-file. Regenerable from the app if ever needed. |
| `BTCSCAM Portal v5.dc.html.PARTIAL-at-256KB` | ⚠️ truncated | v5 source is ~261+ KB — just over the export cap. If v5 changes matter, download it manually from claude.ai (File → export) and replace this. |

## Design identity (protected — do not drift)

- Paper `#FCFBF9` / ink `#101010`, warm "Orange Paper" header zone `#FEF3E2`, rule `#E4E1DB`
- Bitcoin orange `#F7931A` (single action color), `#D2322E` danger-only red
- Type: **Fraunces 600** (headlines only) × **Geist 400/700/900** (UI/body) × **IBM Plex Mono 500/600** (data). **No italics anywhere.**
- Type scale: 16/18/21/24/32/40 + 2 clamp ramps; letter-spacing 0 or .05em only
- Icons: official Lucide markup inline (13 icons, stroke 2.5) → swap to `lucide-react` `size={14} strokeWidth={2.5}` in build
- Masthead: BTC + strikethrough S̶C̶A̶M̶, "THE ANTI-SCAM PAPER OF RECORD", newspaper rules/double rules
- Header system: black wire ticker → conditional CRITICAL alert bar (`#FBEAE9`/`#8C1F1B`) → Orange Paper zone closed by 3px double rule

## Porting rule

The `.dc.html` is the design contract. When building Next.js pages, extract sections screen-by-screen (hash routes `#/...` map to app routes) and keep the token block verbatim as CSS variables / Tailwind theme. Locked versions live in the Claude Design project — never overwrite them there.
