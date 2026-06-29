# Expand Gmail Capabilities

## Goal

Make the MCP server more useful by adding Gmail actions beyond read, search, and plain text send while preserving the new provider-oriented structure.

## Scope

- Add at least two practical Gmail actions, such as archive, mark read, mark unread, add label, or remove label.
- Add the required Gmail OAuth scope when mutation support is implemented.
- Update tool docs and user-facing setup notes.
- Keep tool inputs simple and explicit.

## Acceptance Criteria

- OpenCode can call at least two new Gmail tools successfully.
- New tools are registered in `src/server.ts` and implemented through Gmail API helpers.
- Gmail-specific implementation stays under `src/providers/gmail/`.
- OAuth scopes and README/docs are updated to reflect the new capabilities.
- `npm run check` passes.

## Notes

Prefer `gmail.modify` actions before attachment support because they are smaller and easier to validate.
