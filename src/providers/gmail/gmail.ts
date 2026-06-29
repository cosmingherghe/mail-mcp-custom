import { google, gmail_v1 } from "googleapis"

import type { GoogleOAuthClient } from "./oauth.js"

export function createGmailClient(auth: GoogleOAuthClient): gmail_v1.Gmail {
  return google.gmail({ version: "v1", auth })
}

export async function listEmails(gmail: gmail_v1.Gmail, maxResults: number, query?: string) {
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query,
  })

  return response.data.messages ?? []
}

export async function readEmail(gmail: gmail_v1.Gmail, id: string) {
  const response = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  })

  return response.data
}

export async function sendEmail(
  gmail: gmail_v1.Gmail,
  input: { to: string; subject: string; body: string; cc?: string; bcc?: string },
) {
  const lines = [
    `To: ${input.to}`,
    input.cc ? `Cc: ${input.cc}` : undefined,
    input.bcc ? `Bcc: ${input.bcc}` : undefined,
    `Subject: ${input.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body,
  ].filter(Boolean)

  const raw = Buffer.from(lines.join("\n"), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  })

  return response.data
}

export function messageSummary(message: gmail_v1.Schema$Message) {
  const headers = new Map((message.payload?.headers ?? []).map((header) => [header.name ?? "", header.value ?? ""]))
  const plainText = extractPlainText(message.payload)

  return {
    id: message.id,
    threadId: message.threadId,
    snippet: message.snippet,
    from: headers.get("From") ?? null,
    to: headers.get("To") ?? null,
    subject: headers.get("Subject") ?? null,
    date: headers.get("Date") ?? null,
    body: plainText,
  }
}

function extractPlainText(part: gmail_v1.Schema$MessagePart | undefined): string | null {
  if (!part) return null

  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64").toString("utf8")
  }

  for (const child of part.parts ?? []) {
    const nested = extractPlainText(child)
    if (nested) return nested
  }

  return null
}
