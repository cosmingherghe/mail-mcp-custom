import "dotenv/config"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import { getConfig } from "./config.js"
import { createGmailClient, listEmails, messageSummary, readEmail, sendEmail } from "./providers/gmail/gmail.js"
import { authorize } from "./providers/gmail/oauth.js"

async function main() {
  const config = getConfig()
  const auth = await authorize(config)
  const gmail = createGmailClient(auth)

  const server = new McpServer({
    name: "mail-mcp-custom",
    version: "0.1.0",
  })

  server.registerTool(
    "list_emails",
    {
      description: "List recent Gmail messages, optionally filtered by Gmail search query.",
      inputSchema: {
        maxResults: z.number().int().min(1).max(25).default(10),
        query: z.string().optional(),
      },
    },
    async ({ maxResults, query }) => {
      const messages = await listEmails(gmail, maxResults, query)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(messages, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    "read_email",
    {
      description: "Read a Gmail message by id and return headers, snippet, and plain text body when available.",
      inputSchema: {
        id: z.string(),
      },
    },
    async ({ id }) => {
      const message = await readEmail(gmail, id)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(messageSummary(message), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    "search_emails",
    {
      description: "Search Gmail with a required Gmail query string.",
      inputSchema: {
        query: z.string(),
        maxResults: z.number().int().min(1).max(25).default(10),
      },
    },
    async ({ query, maxResults }) => {
      const messages = await listEmails(gmail, maxResults, query)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(messages, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    "send_email",
    {
      description: "Send a plain text email from the authenticated Gmail account.",
      inputSchema: {
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
        cc: z.string().optional(),
        bcc: z.string().optional(),
      },
    },
    async ({ to, subject, body, cc, bcc }) => {
      const sent = await sendEmail(gmail, { to, subject, body, cc, bcc })
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: sent.id,
                threadId: sent.threadId,
                labelIds: sent.labelIds,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error("mail-mcp-custom failed:", error)
  process.exit(1)
})
