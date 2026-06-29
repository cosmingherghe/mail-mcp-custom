# Add Local Web UI

## Goal

Add a local browser interface for the Gmail MCP backend so the user can list, search, read, send, and safely trash selected emails without needing an MCP-aware chat client.

## Scope

- Add a local Express web server entry point that reuses the existing Gmail OAuth and provider code.
- Serve a simple browser UI from a dedicated `ui/` folder.
- Add API routes for listing, searching, reading, and sending emails.
- Add safe mutation support for moving emails to trash, not permanent deletion.
- Add a preview-and-confirm flow before trashing searched emails.
- Add the required Gmail OAuth scope for mutation support, expected to be `gmail.modify`.
- Update README/setup notes with the local web UI command, URL, and scope implications.

## Acceptance Criteria

- Running the web UI starts a local browser-accessible page, for example on `http://127.0.0.1:4020`.
- The page can list recent emails, search Gmail, open a message, and send a plain text email.
- The page can preview matching emails before moving selected messages to trash.
- Destructive actions require explicit confirmation in the UI.
- Backend Gmail mutation helpers live under `src/providers/gmail/`.
- Existing MCP tools continue to work.
- `npm run check` passes.

## Notes

- Prefer plain HTML/CSS/JS for the first version; React is not required unless the UI grows significantly.
- Do not implement permanent delete in the first pass. Use Gmail trash so messages remain recoverable.
- Keep the app local-only and single-user unless a separate ticket changes that scope.
