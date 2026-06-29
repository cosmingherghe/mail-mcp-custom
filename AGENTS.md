# Agent Instructions

## Project Overview

`mail-mcp-custom` is a local TypeScript project that connects OpenCode and a local browser UI to Gmail through Google OAuth. The MCP server runs over stdio and exposes Gmail tools for listing, reading, searching, and sending email. The optional web UI runs as a local Express server and adds a UI-only action for moving messages to Gmail Trash.

## Entry Points

- `src/server.ts`: MCP stdio server used by OpenCode through `npm run dev`.
- `src/web.ts`: local Express web UI/API server used through `npm run web`.

## Key Files

- `src/server.ts`: MCP server entry point and tool registration.
- `src/web.ts`: local Express server for static UI files and `/api/*` routes.
- `src/config.ts`: environment configuration and default Gmail scopes.
- `src/providers/gmail/oauth.ts`: local Google OAuth browser flow.
- `src/providers/gmail/token-store.ts`: local token persistence.
- `src/providers/gmail/gmail.ts`: Gmail API client helpers.
- `src/providers/llm/openai-compatible.ts`: OpenAI-compatible local LLM client for summaries.
- `ui/index.html`: browser UI markup.
- `ui/app.js`: browser UI behavior and calls to local `/api/*` routes.
- `ui/styles.css`: browser UI styling.
- `doc/opencode-configuration.md`: OpenCode MCP configuration example.

## Capability Matrix

| Capability | MCP Tool | Web UI/API |
| --- | --- | --- |
| List messages | `list_emails` | `GET /api/emails` |
| Search messages | `search_emails` | `GET /api/emails?query=` |
| Read message | `read_email` | `GET /api/emails/:id` |
| Send message | `send_email` | `POST /api/send` |
| Move to trash | Not exposed | `POST /api/emails/:id/trash` |
| Summarize today's inbox | Not exposed | `POST /api/summaries/today` |

## Commands

- Install dependencies: `npm install`
- Run MCP server locally: `npm run dev`
- Run local web UI: `npm run web`
- Type-check: `npm run check`
- Build: `npm run build`
- Run built output: `npm start`

## Environment

Copy `.env.example` to `.env` and fill in Google OAuth values before running the server. The expected redirect URI is `http://127.0.0.1:4010/oauth/callback` unless changed in `.env`. Optional web UI settings are `WEB_HOST`, `WEB_PORT`, and `UI_PATH`. Local AI summaries use `LOCAL_LLM_BASE_URL`, `LOCAL_LLM_API_KEY`, `LOCAL_LLM_MODEL`, `LOCAL_LLM_TIMEOUT_MS`, and `LOCAL_LLM_MAX_TOKENS`.

## Safety Rules

- Do not commit `.env`, OAuth secrets, or files under `data/`.
- Treat `data/gmail-token.json` as sensitive because it contains local Gmail OAuth tokens.
- Keep the default assumption that this is a single-user, local-only server.
- When adding Gmail actions that modify mail, require the correct OAuth scope and update the docs.
- Do not expose the web UI beyond localhost unless explicitly changing the project security model.
- Keep MCP tool behavior and web API behavior documented when adding or removing capabilities.
- Do not call LLM providers directly from browser JavaScript; keep LLM calls server-side in `src/web.ts` or provider modules.

## Documentation Maintenance

Before finishing any code change, check whether the change makes `README.md`, `AGENTS.md`, `doc/architecture-diagram.md`, `doc/opencode-configuration.md`, or `.env.example` stale. If it does, update the affected files in the same change.

Update docs when changing:

- MCP tools, tool names, schemas, or behavior in `src/server.ts`.
- Web API routes or UI behavior in `src/web.ts` or `ui/`.
- Gmail scopes, environment variables, ports, token paths, or OAuth behavior.
- Setup, run, build, validation, or OpenCode configuration steps.
- Security assumptions, provider support, or project limitations.

If no documentation update is needed, mention that in the final response.

## Validation

Run `npm run check` after TypeScript changes. Run `npm run build` when changing runtime behavior or package configuration. If changing UI behavior only, manually run `npm run web` and verify the affected route or browser action when feasible.
