# mail-mcp-custom

Custom mail MCP server for local use with `opencode`, without Composio. The current provider is Gmail.

## Project Map

- `src/server.ts`: MCP stdio entry point for OpenCode and MCP tool registration
- `src/web.ts`: local Express server for the browser UI and local `/api/*` routes
- `src/config.ts`: environment configuration, OAuth settings, token path, UI path, and Gmail scopes
- `src/providers/gmail/oauth.ts`: local Google OAuth browser flow
- `src/providers/gmail/token-store.ts`: local OAuth token persistence
- `src/providers/gmail/gmail.ts`: Gmail API client helpers
- `src/providers/llm/openai-compatible.ts`: local OpenAI-compatible LLM client for email summaries
- `ui/`: static browser UI served by `src/web.ts`
- `doc/`: architecture notes and OpenCode configuration

## Entry Points

- MCP server for OpenCode: `npm run dev`
- Local browser UI: `npm run web`
- Type-check: `npm run check`
- Build: `npm run build`

## Documentation Maintenance

When code changes affect behavior, setup, commands, environment variables, MCP tools, web routes, security assumptions, or limitations, update the relevant docs in the same change. Check `README.md`, `AGENTS.md`, `doc/architecture-diagram.md`, `doc/opencode-configuration.md`, and `.env.example` before finishing.

## Included Features

- Local Google OAuth for a single user
- Token persistence in `data/gmail-token.json`
- Basic MCP tools:
  - `list_emails`
  - `read_email`
  - `search_emails`
  - `send_email`
- Optional local web UI for listing, searching, reading, sending, and moving messages to Gmail Trash
- Local AI summary for emails received today through an OpenAI-compatible endpoint

## Capability Matrix

| Capability | MCP Tool | Web UI/API |
| --- | --- | --- |
| List messages | `list_emails` | `GET /api/emails` |
| Search messages | `search_emails` | `GET /api/emails?query=` |
| Read message | `read_email` | `GET /api/emails/:id` |
| Send message | `send_email` | `POST /api/send` |
| Move to trash | Not exposed | `POST /api/emails/:id/trash` |
| Summarize today's inbox | Not exposed | `POST /api/summaries/today` |

## Google Cloud Setup

1. Create a project in Google Cloud.
2. Enable the `Gmail API`.
3. Configure the `OAuth consent screen`.
4. Create an `OAuth Client ID` of type `Web application`.
5. Add this redirect URI:

```text
http://127.0.0.1:4010/oauth/callback
```

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill in the Google OAuth values.
3. Run:

```bash
npm install
npm run dev
```

On the first run, your browser opens for Google authentication.

## Local Web UI

Run the browser UI with:

```bash
npm run web
```

Then open:

```text
http://127.0.0.1:4020
```

The UI serves files from `ui/` and exposes local-only API routes from `src/web.ts`.

Optional environment settings:

```text
WEB_HOST=127.0.0.1
WEB_PORT=4020
UI_PATH=./ui
```

Trash actions move messages to Gmail Trash. They do not permanently delete mail.

## Local AI Summaries

The web UI can summarize emails received today with a local OpenAI-compatible LLM. The browser calls `src/web.ts`, and the server calls the configured local LLM endpoint.

Default local LLM settings:

```text
LOCAL_LLM_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_LLM_API_KEY=local
LOCAL_LLM_MODEL=qwen/qwen3.5-9b
LOCAL_LLM_TIMEOUT_MS=180000
LOCAL_LLM_MAX_TOKENS=4096
```

The summary flow searches Gmail for today's inbox messages, reads each message, truncates long bodies, sends the summary prompt to the local LLM, and filters the visible message list to the summarized messages.

## Initial Scopes

- `gmail.readonly`
- `gmail.send`
- `gmail.modify`

`gmail.modify` is required for moving messages to Trash from the local web UI.

## OpenCode Config

The OpenCode configuration for this project is documented separately in `doc/opencode-configuration.md`.

## Current Limitations

- Single local user only
- Plain text email sending only
- No attachments
- Trash support only moves messages to Gmail Trash; permanent delete is not implemented
- AI summaries currently support only the `local_llm` provider; OpenCode provider switching is planned but not wired yet
- No custom refresh-token logic outside the Google client
