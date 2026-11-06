# Project brain

## What this is

Routa's IT configures its identity platform by asking Claude, through this MCP server. The brief is in `client/brief.md`.

## What we found out

- The admin API applies a PATCH at once and has no preview, so the server keeps its own.
- The API doesn't enforce scope: any valid token can PATCH. `whoami` says what a token is, and the server must refuse.
- `session-length-hours` takes a number, `guest-access` a string, and the `mfa.*` policies true or false.

## Rules that cost us if we break them

- A read-only token never changes a setting.
- Every change is shown before it is applied, and what is applied is what was shown.

## The baseline

- `client/security-baseline.json` lists, per group, the applications it may reach, and the value of each policy (`mfa.<group>`, `session-length-hours`, `legacy-sign-in`, `guest-access` and others).
- The test environment differs from it in 9 places: 4 access, 5 policies. A read-only token can read all of it, so a tool that only compares needs no admin token.
- `tools/baseline-check.ts` compares too, but it can't see a group or policy that the baseline has and the platform lacks.
