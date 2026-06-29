# Improve User Onboarding

## Goal

Make the project easy for a new user to configure, run, and connect to OpenCode without needing extra guidance.

## Scope

- Expand the README with complete Google Cloud setup steps.
- Document the OpenCode setup flow and link to `doc/opencode-configuration.md`.
- Add troubleshooting for common OAuth, `.env`, redirect URI, and MCP startup errors.
- Clarify the first-run browser authentication flow.

## Acceptance Criteria

- A new user can create Google OAuth credentials, configure `.env`, run the server, and connect it to OpenCode using only repository docs.
- The README clearly points users to the OpenCode configuration example.
- Common setup failures have clear troubleshooting notes.

## Notes

Keep the docs practical and local-development focused. Avoid adding production deployment guidance unless the project scope changes.
