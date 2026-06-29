# Agent Instructions

## Project Overview

`mail-mcp-custom` is a local TypeScript MCP server that connects OpenCode to mail providers. The current provider is Gmail through Google OAuth. It runs over stdio and exposes Gmail tools for listing, reading, searching, and sending email.

## Key Files

- `src/server.ts`: MCP server entry point and tool registration.
- `src/config.ts`: environment configuration and default Gmail scopes.
- `src/providers/gmail/oauth.ts`: local Google OAuth browser flow.
- `src/providers/gmail/token-store.ts`: local token persistence.
- `src/providers/gmail/gmail.ts`: Gmail API client helpers.
- `doc/opencode-configuration.md`: OpenCode MCP configuration example.

## Commands

- Install dependencies: `npm install`
- Run locally: `npm run dev`
- Type-check: `npm run check`
- Build: `npm run build`
- Run built output: `npm start`

## Environment

Copy `.env.example` to `.env` and fill in Google OAuth values before running the server. The expected redirect URI is `http://127.0.0.1:4010/oauth/callback` unless changed in `.env`.

## Safety Rules

- Do not commit `.env`, OAuth secrets, or files under `data/`.
- Treat `data/gmail-token.json` as sensitive because it contains local Gmail OAuth tokens.
- Keep the default assumption that this is a single-user, local-only server.
- When adding Gmail actions that modify mail, require the correct OAuth scope and update the docs.

## Validation

Run `npm run check` after TypeScript changes. Run `npm run build` when changing runtime behavior or package configuration.
