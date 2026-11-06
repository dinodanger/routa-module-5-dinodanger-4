import { readFileSync } from "node:fs";
import { baselineDifferences } from "../baseline.ts";
import type { Baseline } from "../baseline.ts";
import { getSettings } from "../platform.ts";
import { requireToken } from "../token-check.ts";

const baselineFile = new URL("../../../client/security-baseline.json", import.meta.url);

export const baselineDifferencesTool = {
  name: "baseline_differences",
  description: "List every setting that differs from Routa's security baseline, in plain words. Only reads: it changes nothing, and a read-only token can use it.",
  inputSchema: { type: "object", properties: {} },
  async handler() {
    await requireToken();
    let baseline: Baseline;
    try {
      baseline = JSON.parse(readFileSync(baselineFile, "utf8"));
    } catch {
      throw new Error("Could not read client/security-baseline.json. Check that the file is there and is valid JSON, then try again.");
    }
    const lines = baselineDifferences(baseline, await getSettings());
    if (lines.length === 0) return "Every setting matches the baseline.";
    return `${lines.length} settings differ from the baseline:\n${lines.map((l) => `- ${l}`).join("\n")}`;
  },
};
