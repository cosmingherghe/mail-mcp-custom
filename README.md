# mail-mcp-custom

Custom mail MCP server for local use with `opencode`, without Composio. The current provider is Gmail.

## Included Features

- Local Google OAuth for a single user
- Token persistence in `data/gmail-token.json`
- Basic MCP tools:
  - `list_emails`
  - `read_email`
  - `search_emails`
  - `send_email`

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

## Initial Scopes

- `gmail.readonly`
- `gmail.send`

If you later want inbox modifications, labels, or archiving support, add `gmail.modify`.

## OpenCode Config

The OpenCode configuration for this project is documented separately in `doc/opencode-configuration.md`.

## Current Limitations

- Single local user only
- Plain text email sending only
- No attachments
- No custom refresh-token logic outside the Google client
