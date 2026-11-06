// Every change is shown before it is applied: a tool that calls patchSettings
// must also call showChange. apply-change.ts is the one exception, because it
// applies a change that preview-change.ts already showed.
import { readdirSync, readFileSync } from "node:fs";

const dir = "mcp/src/tools";
const exempt = new Set(["apply-change.ts", "index.ts"]);
const calls = (src: string, fn: string) => new RegExp(`\\b${fn}\\s*\\(`).test(src);
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const failures = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !exempt.has(f))
  .filter((f) => {
    const src = stripComments(readFileSync(`${dir}/${f}`, "utf8"));
    return calls(src, "patchSettings") && !calls(src, "showChange");
  });

for (const f of failures) {
  console.error(`${dir}/${f}: calls patchSettings without calling showChange`);
}
process.exit(failures.length ? 1 : 0);
