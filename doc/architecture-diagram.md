# Architecture Diagram

Project: `mail-mcp-custom`

```text
+------------------+          +------------------+
| OpenCode         |          | Browser          |
| opencode config  |          | localhost UI     |
+--------+---------+          +--------+---------+
         |                             |
         | runs: npm run dev          | opens http://127.0.0.1:4020
         v                             v
+------------------+          +------------------+
| src/server.ts    |          | src/web.ts       |
| MCP over stdio   |          | Express UI/API   |
+--------+---------+          +--------+---------+
         |                             |
         |                             +------------------+
         |                                                |
         v                                                v
+------------------+                            +------------------+
| MCP tools        |                            | ui/ static files |
| list/read/search |                            | index/app/styles |
| send             |                            +------------------+
+--------+---------+
         |
         +------------------+------------------+
                            |
                            v
                  +------------------+
                  | config.ts       |
                  | reads .env      |
                  | scopes/paths    |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | oauth.ts        |
                  | local OAuth     |
                  | /oauth/callback |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | token-store.ts  |
                  | data/gmail-token|
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | gmail.ts        |
                  | Gmail API       |
                  +------------------+

Browser summary flow:

+------------------+     +-----------------------+     +------------------+
| Browser UI       | --> | POST /api/summaries/  | --> | gmail.ts         |
| Local AI button  |     | today in src/web.ts   |     | read today mail  |
+------------------+     +-----------+-----------+     +------------------+
                                      |
                                      v
                            +-----------------------+
                            | openai-compatible.ts  |
                            | LOCAL_LLM_* config    |
                            +-----------+-----------+
                                        |
                                        v
                            +-----------------------+
                            | Local LLM endpoint    |
                            | 127.0.0.1:1234/v1    |
                            +-----------------------+
```

## Summary

1. `opencode` starts the local MCP server with `npm run dev`.
2. A browser can start the local UI server with `npm run web`.
3. Both entry points authenticate one local Gmail user with Google OAuth.
4. Tokens are stored locally in `data/gmail-token.json`.
5. The MCP server exposes 4 tools: `list_emails`, `read_email`, `search_emails`, and `send_email`.
6. The web UI exposes local-only API routes for listing, searching, reading, sending, moving messages to Gmail Trash, and summarizing today's inbox with a local LLM.

## Capability Matrix

| Capability | MCP Tool | Web UI/API |
| --- | --- | --- |
| List messages | `list_emails` | `GET /api/emails` |
| Search messages | `search_emails` | `GET /api/emails?query=` |
| Read message | `read_email` | `GET /api/emails/:id` |
| Send message | `send_email` | `POST /api/send` |
| Move to trash | Not exposed | `POST /api/emails/:id/trash` |
| Summarize today's inbox | Not exposed | `POST /api/summaries/today` |
