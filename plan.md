# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change; apply_change applies it (the lint found it applying directly)
- [x] copy_group_access only shows the change and needs an admin token (the security judge found it applying with a read-only token and without a preview)
- [x] settings-shape test skips when the local recording is absent, so CI passes (the recording is gitignored)
- [x] baseline_differences: list, in plain words, every setting that differs from client/security-baseline.json; read-only, works with a read-only token, changes nothing
