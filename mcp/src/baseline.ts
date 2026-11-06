// Compares the platform's settings with Routa's security baseline and says each difference in plain words.
import type { Settings } from "./platform.ts";

export type Baseline = {
  access: Record<string, string[]>;
  policies: Record<string, boolean | number | string>;
};

const say = (value: unknown) => (typeof value === "boolean" ? (value ? "on" : "off") : String(value));

export function baselineDifferences(baseline: Baseline, settings: Settings): string[] {
  const lines: string[] = [];

  for (const { group, apps } of settings.access) {
    const expected = baseline.access[group];
    if (!expected) lines.push(`${group} isn't in the baseline, and it reaches ${apps.length ? apps.join(", ") : "nothing"}.`);
    for (const app of apps) if (!(expected ?? []).includes(app)) lines.push(`${group} can reach ${app}, but the baseline says it shouldn't.`);
    for (const app of expected ?? []) if (!apps.includes(app)) lines.push(`${group} can't reach ${app}, but the baseline says it should.`);
  }
  for (const group of Object.keys(baseline.access)) {
    if (!settings.access.some((a) => a.group === group)) lines.push(`The baseline has a group called ${group}, but the platform doesn't.`);
  }

  for (const { id, label, value } of settings.policies) {
    if (!(id in baseline.policies)) lines.push(`${label} (${id}) is ${say(value)}, and the baseline doesn't cover it.`);
    else if (baseline.policies[id] !== value) lines.push(`${label} (${id}) is ${say(value)}, but the baseline says ${say(baseline.policies[id])}.`);
  }
  for (const id of Object.keys(baseline.policies)) {
    if (!settings.policies.some((p) => p.id === id)) lines.push(`The baseline has a policy called ${id}, but the platform doesn't.`);
  }

  return lines;
}
