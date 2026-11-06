import assert from "node:assert/strict";
import { test } from "node:test";
import { baselineDifferences } from "../src/baseline.ts";
import type { Baseline } from "../src/baseline.ts";
import { baselineDifferencesTool } from "../src/tools/baseline-differences.ts";
import { fakePlatform } from "./fake-platform.ts";

const baseline: Baseline = {
  access: { staff: ["documents"], contractors: [], gone: ["crm"] },
  policies: { "session-length-hours": 8, "legacy-sign-in": false, missing: true },
};
const settings = {
  access: [
    { group: "staff", apps: ["timesheets"] },
    { group: "contractors", apps: [] },
    { group: "extra", apps: [] },
  ],
  policies: [
    { id: "session-length-hours", label: "Session length in hours", value: 24 },
    { id: "legacy-sign-in", label: "Allow legacy sign-in", value: true },
    { id: "other", label: "Other", value: 1 },
  ],
};

test("says each difference in plain words", () => {
  assert.deepEqual(baselineDifferences(baseline, settings), [
    "staff can reach timesheets, but the baseline says it shouldn't.",
    "staff can't reach documents, but the baseline says it should.",
    "extra isn't in the baseline, and it reaches nothing.",
    "The baseline has a group called gone, but the platform doesn't.",
    "Session length in hours (session-length-hours) is 24, but the baseline says 8.",
    "Allow legacy sign-in (legacy-sign-in) is on, but the baseline says off.",
    "Other (other) is 1, and the baseline doesn't cover it.",
    "The baseline has a policy called missing, but the platform doesn't.",
  ]);
});

test("says so when everything matches", () => {
  const same = { access: [{ group: "staff", apps: ["documents"] }], policies: [{ id: "a", label: "A", value: true }] };
  assert.deepEqual(baselineDifferences({ access: { staff: ["documents"] }, policies: { a: true } }, same), []);
});

test("baseline_differences works with a read-only token and changes nothing", async () => {
  const { patches } = fakePlatform("read");
  const answer = await baselineDifferencesTool.handler();
  assert.match(answer, /settings differ from the baseline/);
  assert.match(answer, /session-length-hours\) is 24, but the baseline says 8/);
  assert.equal(patches.length, 0);
});

test("baseline_differences makes no PATCH call at all", async () => {
  fakePlatform("admin");
  const methods: string[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = ((input: string, init?: RequestInit) => (methods.push(init?.method ?? "GET"), real(input, init))) as typeof fetch;
  await baselineDifferencesTool.handler();
  assert.deepEqual([...new Set(methods)].sort(), ["GET"]);
});
