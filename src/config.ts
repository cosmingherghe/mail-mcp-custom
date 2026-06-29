import path from "node:path"

export type AppConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  oauthPort: number
  tokenPath: string
  scopes: string[]
}

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
]

export function getConfig(): AppConfig {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI ?? "http://127.0.0.1:4010/oauth/callback"
  const oauthPort = Number.parseInt(process.env.GMAIL_OAUTH_PORT ?? "4010", 10)
  const tokenPath = path.resolve(process.cwd(), process.env.GMAIL_TOKEN_PATH ?? "./data/gmail-token.json")

  if (!clientId || !clientSecret) {
    throw new Error("Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in environment")
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    oauthPort,
    tokenPath,
    scopes: DEFAULT_SCOPES,
  }
}
