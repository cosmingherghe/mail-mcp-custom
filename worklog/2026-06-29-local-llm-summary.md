# Local LLM Email Summary Worklog

Date: 2026-06-29
Status: unpushed, pending user testing

## Goal

Add the first slice of AI email summaries to the local web UI using a local OpenAI-compatible LLM endpoint. OpenCode provider switching is documented as a future slice, but this change only implements `local_llm`.

## Added

- Backlog ticket: `.backlog/tickets/005-add-ai-email-summary-providers.md`
- Local LLM client: `src/providers/llm/openai-compatible.ts`
- Web route: `POST /api/summaries/today`
- UI controls:
  - `Summary provider` selector
  - `Summarize today's emails` button
- Local LLM environment variables:
  - `LOCAL_LLM_BASE_URL`
  - `LOCAL_LLM_API_KEY`
  - `LOCAL_LLM_MODEL`
  - `LOCAL_LLM_TIMEOUT_MS`
  - `LOCAL_LLM_MAX_TOKENS`

## Behavior

The web UI summary flow:

1. Searches Gmail for today's inbox emails.
2. Reads each matching message.
3. Builds a bounded prompt with sender, subject, date, snippet/body.
4. Truncates long email bodies before sending them to the LLM.
5. Calls the local OpenAI-compatible endpoint from `src/web.ts`.
6. Returns the generated summary and messages used.
7. Filters the visible message list to the summarized emails.
8. Renders the summary in the reader pane.

## Local LLM Defaults

```text
LOCAL_LLM_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_LLM_API_KEY=local
LOCAL_LLM_MODEL=qwen/qwen3.5-9b
LOCAL_LLM_TIMEOUT_MS=180000
LOCAL_LLM_MAX_TOKENS=4096
```

`LOCAL_LLM_MAX_TOKENS` defaults to `4096` because `qwen/qwen3.5-9b` can spend many tokens in `reasoning_content` before returning visible `message.content`.

## Files Changed

- `.env.example`
- `AGENTS.md`
- `README.md`
- `doc/architecture-diagram.md`
- `src/config.ts`
- `src/web.ts`
- `src/providers/llm/openai-compatible.ts`
- `ui/app.js`
- `ui/index.html`
- `ui/styles.css`
- `.backlog/tickets/005-add-ai-email-summary-providers.md`
- `worklog/2026-06-29-local-llm-summary.md`

## Validation Completed

- `npm run check` passed.
- `git diff --check` passed.
- Direct local LLM test against `http://127.0.0.1:1234/v1/chat/completions` returned usable `choices[0].message.content` with a larger token budget.

## Manual Test Plan

1. Make sure the local OpenAI-compatible server is running.
2. Make sure `.env` has the `LOCAL_LLM_*` settings, or rely on defaults.
3. Run `npm run web`.
4. Open `http://127.0.0.1:4020`.
5. Click `Summarize today's emails`.
6. Confirm the UI filters the message list to today's inbox messages.
7. Confirm the reader pane shows an AI-generated summary.

## Not Included Yet

- OpenCode summary provider integration.
- MCP tool for summaries.
- Automated tests or CI checks.
