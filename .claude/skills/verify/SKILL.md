---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Verify fails if any check fails. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent that didn't build the server reads it against a file of criteria. See below.

## The security judge

**Input:** the criteria file. It defaults to `client/security-criteria.md`. If the user or the caller names another file, use that one instead and pass its path to the judge. Don't copy the criteria into this skill; the judge reads whatever file it is given.

**Launch** one agent with the Agent tool (`subagent_type: "general-purpose"`, not a fork, so it inherits none of this conversation). Give it only the criteria path and the instructions below. Don't tell it what was built, what you think is safe, or what earlier checks found: it must form its own view.

> You are a security judge. You did not build this server and have no history with it.
> Read the criteria in `<criteria path>`. Then read the server in `mcp/src` (every file, including `tools/`), and `.mcp.json`, `.gitignore` and the repository's tracked files for anything the criteria cover. Read-only: don't edit, run or fix anything, and don't read token files or print any token value.
> Judge the code as written, not what its comments or descriptions claim. Check each criterion in the file against the code, one at a time.
> Report every finding as: severity (`low`, `medium`, `high` or `critical`, using the file's own rules for what each severity means), the rule it breaks, `path:line`, and the line you saw, quoted exactly. A finding without a file, line and quote doesn't count; leave it out. If a criterion is met, say so in one line, naming the file you checked. If a criterion can't be checked from the code, say that, don't guess.
> End with one line: `VERDICT: FAIL` if any finding is high or critical, otherwise `VERDICT: PASS`.

**Result:** the check fails if any finding is `high` or `critical`. Report the judge's findings as they came, with severity, file, line and quote. `low` and `medium` findings are noted and don't fail the check. Don't override the judge's ratings; if you disagree with one, say so next to it. If the judge returns no verdict line, or findings without a file and line, the check hasn't run: run it again.
