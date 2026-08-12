"use server";

import { headers } from "next/headers";

import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import type { RegistryActionState } from "@/components/desk/registry/types";
import { isLocalRegistry } from "@/lib/registry/fs-state";
import { publishDossier, unpublishDossier } from "@/lib/registry/publish";

// Registry actions mutate the working tree. Two gates, both re-verified here
// because server actions are directly POST-reachable:
//   1. local-only — dev server with writable data/, refuses anywhere else
//   2. desk auth — editor Basic auth OR mod session, same as every desk action

async function requireLocalDesk(): Promise<string | null> {
  if (!(await isLocalRegistry())) {
    return "REGISTRY IS LOCAL-ONLY — this action runs only on a local dev server with a writable data/ directory.";
  }
  const h = await headers();
  if (verifyEditorAuth(h.get("authorization"))) return null;
  if (await getModActor()) return null;
  return "NOT AUTHORIZED — desk credentials required.";
}

function refused(error: string): RegistryActionState {
  return { ok: false, steps: [], error };
}

export async function publishAction(
  _prev: RegistryActionState | null,
  formData: FormData,
): Promise<RegistryActionState> {
  const denied = await requireLocalDesk();
  if (denied) return refused(denied);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return refused("missing slug");
  const steps = await publishDossier(slug);
  const ok = steps.every((s) => s.ok);
  return {
    ok,
    steps,
    error: ok
      ? null
      : "some steps failed — completed steps skip themselves, so fixing the cause and clicking again finishes the job",
  };
}

export async function unpublishAction(
  _prev: RegistryActionState | null,
  formData: FormData,
): Promise<RegistryActionState> {
  const denied = await requireLocalDesk();
  if (denied) return refused(denied);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return refused("missing slug");
  const steps = await unpublishDossier(slug);
  const ok = steps.every((s) => s.ok);
  return {
    ok,
    steps,
    error: ok
      ? null
      : "some steps failed — completed steps skip themselves, so fixing the cause and clicking again finishes the job",
  };
}
