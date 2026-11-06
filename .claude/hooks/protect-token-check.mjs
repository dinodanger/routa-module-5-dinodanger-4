// PreToolUse hook: refuse any change to mcp/src/token-check.ts.
// Exit 2 blocks the tool call and shows stderr to Claude.
import path from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = /token-check\.ts/;

const input = JSON.parse(await new Promise((resolve) => {
  let s = "";
  process.stdin.on("data", (c) => (s += c)).on("end", () => resolve(s || "{}"));
}));

const deny = (why) => {
  console.error(`Blocked: ${PROTECTED} must not be changed (${why}).`);
  process.exit(2);
};

const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const { tool_name: tool, tool_input: args = {} } = input;

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const p = args.file_path ?? args.notebook_path ?? "";
  if (path.resolve(input.cwd ?? root, p) === path.resolve(root, PROTECTED)) deny(`${tool} on it`);
}

if (tool === "Bash") {
  const command = String(args.command ?? "");
  // A command that only mentions the file (git add, cat, grep, ...) is fine.
  // Split into simple commands and look for ones that write to it.
  for (const seg of command.split(/&&|\|\||;|\||\n/)) {
    if (!NAME.test(seg)) continue;
    const words = seg.trim().split(/\s+/);
    const cmd = words.find((w) => !/^\w+=/.test(w)) ?? "";
    const base = path.basename(cmd);
    const redirect = />>?\s*["']?[^\s"']*token-check\.ts/.test(seg);
    const writer = /^(tee|rm|mv|cp|install|truncate|dd|ln|shred|sed|perl|ruby|python3?|node|awk|patch|ed|ex|vim?|nano|code)$/.test(base)
      && (base !== "sed" && base !== "perl" || /\s-\w*i/.test(seg) || /--in-place/.test(seg))
      && (base !== "cp" || new RegExp(`${NAME.source}["']?\\s*$`).test(seg.trim()))
      && (!/^(python3?|node|ruby|awk)$/.test(base) || /write|open\(|>|unlink|rename|copy|rm\b|sed/i.test(seg));
    const gitWriter = base === "git" && /\b(checkout|restore|apply|rm|mv|stash|reset|clean|merge-file)\b/.test(seg);
    if (redirect || writer || gitWriter) deny("shell command writing to it");
  }
}
