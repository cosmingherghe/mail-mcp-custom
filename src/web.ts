import "dotenv/config"

import express from "express"

import { getConfig } from "./config.js"
import { createChatCompletion } from "./providers/llm/openai-compatible.js"
import { createGmailClient, listEmails, messageSummary, readEmail, sendEmail, trashEmail } from "./providers/gmail/gmail.js"
import { authorize } from "./providers/gmail/oauth.js"

async function main() {
  const config = getConfig()
  const auth = await authorize(config)
  const gmail = createGmailClient(auth)
  const app = express()

  app.use(express.json())
  app.use(express.static(config.uiPath))

  app.get("/api/emails", async (request, response, next) => {
    try {
      const maxResults = parseMaxResults(request.query.maxResults)
      const query = typeof request.query.query === "string" ? request.query.query : undefined
      const messages = await listEmails(gmail, maxResults, query)

      response.json({ messages })
    } catch (error) {
      next(error)
    }
  })

  app.get("/api/emails/:id", async (request, response, next) => {
    try {
      const message = await readEmail(gmail, request.params.id)

      response.json(messageSummary(message))
    } catch (error) {
      next(error)
    }
  })

  app.post("/api/send", async (request, response, next) => {
    try {
      const input = request.body as { to?: unknown; subject?: unknown; body?: unknown; cc?: unknown; bcc?: unknown }

      if (typeof input.to !== "string" || typeof input.subject !== "string" || typeof input.body !== "string") {
        response.status(400).json({ error: "to, subject, and body are required" })
        return
      }

      const sent = await sendEmail(gmail, {
        to: input.to,
        subject: input.subject,
        body: input.body,
        cc: typeof input.cc === "string" && input.cc ? input.cc : undefined,
        bcc: typeof input.bcc === "string" && input.bcc ? input.bcc : undefined,
      })

      response.json({ id: sent.id, threadId: sent.threadId, labelIds: sent.labelIds })
    } catch (error) {
      next(error)
    }
  })

  app.post("/api/emails/:id/trash", async (request, response, next) => {
    try {
      const trashed = await trashEmail(gmail, request.params.id)

      response.json({ id: trashed.id, threadId: trashed.threadId, labelIds: trashed.labelIds })
    } catch (error) {
      next(error)
    }
  })

  app.post("/api/summaries/today", async (request, response, next) => {
    try {
      const input = request.body as { provider?: unknown; maxResults?: unknown }
      const provider = typeof input.provider === "string" ? input.provider : "local_llm"

      if (provider !== "local_llm") {
        response.status(400).json({ error: "Only local_llm summaries are supported right now" })
        return
      }

      const maxResults = parseMaxResults(input.maxResults)
      const query = todaysInboxQuery()
      const messages = await listEmails(gmail, maxResults, query)
      const summaries = await Promise.all(
        messages.map(async (message) => {
          const fullMessage = await readEmail(gmail, message.id ?? "")
          return messageSummary(fullMessage)
        }),
      )

      if (summaries.length === 0) {
        response.json({ provider, query, messages: [], summary: "No inbox emails were found for today." })
        return
      }

      const summary = await createChatCompletion(config.localLlm, [
        {
          role: "system",
          content:
            "You summarize email digests. Return only the final summary. Do not include reasoning or hidden analysis.",
        },
        {
          role: "user",
          content: buildTodaySummaryPrompt(summaries),
        },
      ])

      response.json({ provider, query, messages: summaries, summary })
    } catch (error) {
      next(error)
    }
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    response.status(500).json({ error: message })
  })

  app.listen(config.webPort, config.webHost, () => {
    console.log(`mail-mcp-custom UI running at http://${config.webHost}:${config.webPort}`)
  })
}

function parseMaxResults(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.min(Math.max(Math.trunc(value), 1), 25)
  if (typeof value !== "string") return 10

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 10

  return Math.min(Math.max(parsed, 1), 25)
}

function todaysInboxQuery() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return `in:inbox after:${formatGmailDate(today)} before:${formatGmailDate(tomorrow)}`
}

function formatGmailDate(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function buildTodaySummaryPrompt(messages: ReturnType<typeof messageSummary>[]) {
  const emailBlocks = messages
    .map((message, index) => {
      const body = truncateText(message.body ?? message.snippet ?? "", 1800)

      return [
        `Email ${index + 1}`,
        `From: ${message.from ?? "Unknown"}`,
        `Subject: ${message.subject ?? "(no subject)"}`,
        `Date: ${message.date ?? "Unknown"}`,
        `Body: ${body || "No plain text body available."}`,
      ].join("\n")
    })
    .join("\n\n---\n\n")

  return `Summarize the emails received today. Include:\n- A concise overview\n- Important or urgent items\n- Action items\n- Notable senders and subjects\n\nEmails:\n\n${emailBlocks}`
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}... [truncated]`
}

main().catch((error) => {
  console.error("mail-mcp-custom UI failed:", error)
  process.exit(1)
})
