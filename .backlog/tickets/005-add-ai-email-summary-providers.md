# Add AI Email Summary Providers

## Goal

Add a provider-based email summary flow to the local web UI so the user can summarize emails received today with either a local OpenAI-compatible LLM or, later, OpenCode's local HTTP API.

## First Slice

- Add local OpenAI-compatible LLM support through `LOCAL_LLM_*` environment variables.
- Add a web API route that finds today's inbox messages, reads them, and sends a bounded prompt to the local LLM.
- Add a UI control to summarize today's received emails and filter the message list to those messages.
- Keep the browser from calling the LLM directly; all LLM calls must go through `src/web.ts`.

## Future Slice

- Add an OpenCode provider once the local OpenCode API base URL, endpoint shape, authentication, and response format are confirmed.
- Allow switching between local LLM and OpenCode providers from the UI.

## Acceptance Criteria

- Local LLM config supports an OpenAI-compatible endpoint such as LM Studio at `http://127.0.0.1:1234/v1`.
- The summary route returns a generated summary and the list of messages used for the summary.
- The UI filters the visible message list to today's summarized emails.
- Email bodies are truncated before being sent to the LLM.
- `npm run check` passes.
- Docs and `.env.example` reflect the new local LLM configuration.
