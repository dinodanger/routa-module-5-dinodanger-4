// Checks our settings against a copy of what the platform returned when we built this.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

// The recording comes from Routa's own platform and is not committed, so a fresh checkout (CI) doesn't have it.
const recording = new URL("./fixtures/local-settings.json", import.meta.url);
const missing = existsSync(recording) ? false : "no local recording of the platform's settings in mcp/test/fixtures";

test("the recorded settings have the shape the tools expect", { skip: missing }, () => {
  const recorded = JSON.parse(readFileSync(recording, "utf8"));
  assert.ok(Array.isArray(recorded.access));
  assert.ok(recorded.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(recorded.policies.every((p: { id: string }) => typeof p.id === "string"));
});
