# Architecture Diagram

Project: `mail-mcp-custom`

```text
+------------------+
      | OpenCode         |
      | opencode.jsonc   |
      | mcp.gmail-custom |
+---------+--------+
          |
          | runs: npm run dev
          v
+------------------------------+
| mail-mcp-custom              |
| src/server.ts                |
| MCP server over stdio        |
+-----+-----------+------------+
      |           |
      |           +-----------------------------+
      |                                         |
      v                                         v
+-------------+                         +------------------+
| config.ts   |                         | providers/gmail |
| reads .env  |                         | local Google     |
| client id   |                         | OAuth flow       |
| secret      |                         | opens browser    |
| redirect URI|                         | listens on       |
| token path  |                         | /oauth/callback  |
+------+------+                         +--------+---------+
       |                                         |
       |                                         v
       |                               +------------------+
       |                               | token-store.ts   |
       |                               | save/load token  |
       |                               | data/gmail-token |
       |                               +--------+---------+
       |                                         |
       +-----------------------------------------+
                                                 |
                                                 v
                                      +------------------+
                                      | gmail.ts         |
                                      | Google Gmail API |
                                      +----+----+----+---+
                                           |    |    |
                                           |    |    |
                                           v    v    v
                                   list_emails read_email
                                   search_emails send_email
```

## Summary

1. `opencode` starts a local MCP server from your config.
2. The server authenticates one local Gmail user with Google OAuth.
3. Tokens are stored locally in `data/gmail-token.json`.
4. The server exposes 4 MCP tools:
   - `list_emails`
   - `read_email`
   - `search_emails`
   - `send_email`
