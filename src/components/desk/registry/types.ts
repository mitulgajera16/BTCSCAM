/**
 * Registry desk view types. No Node imports — client components consume
 * this file (house rule, see src/components/desk/types.ts).
 */

export type StepView = { step: string; ok: boolean; detail: string };

export type RegistryActionState = {
  ok: boolean;
  steps: StepView[];
  error: string | null;
};

export type DraftView = {
  slug: string;
  fileName: string;
  title: string;
  trustState: string;
  severity: string;
  categories: string[];
  flags: string[];
  sourceCount: number;
  parseError: string | null;
};

export type PublishedView = {
  slug: string;
  id: string;
  title: string;
  publishedDate: string;
  badges: { label: string; ok: boolean }[];
};

export type DbOnlyView = { id: string; slug: string; title: string };

/** The pipeline shown in the confirm panel — mirrors publish.ts step order. */
export const PUBLISH_PIPELINE = [
  "validate schema + sources",
  "set published date to today",
  "move file to data/incidents/",
  "seed Supabase row (prod live within ~5 min)",
  "revalidate caches",
  "git commit + push (Vercel deploys)",
] as const;

export const UNPUBLISH_PIPELINE = [
  "delete Supabase row (prod drops it within ~5 min)",
  "move file back to data/drafts/",
  "revalidate caches",
  "git commit + push (deploy clears the bundled copy)",
] as const;
