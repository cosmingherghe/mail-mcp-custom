import path from "node:path"

export type AppConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  oauthPort: number
  tokenPath: string
  scopes: string[]
  webHost: string
  webPort: number
  uiPath: string
  localLlm: {
    baseUrl: string
    apiKey: string
    model: string
    timeoutMs: number
    maxTokens: number
  }
}

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
]

export function getConfig(): AppConfig {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI ?? "http://127.0.0.1:4010/oauth/callback"
  const oauthPort = Number.parseInt(process.env.GMAIL_OAUTH_PORT ?? "4010", 10)
  const tokenPath = path.resolve(process.cwd(), process.env.GMAIL_TOKEN_PATH ?? "./data/gmail-token.json")
  const webHost = process.env.WEB_HOST ?? "127.0.0.1"
  const webPort = Number.parseInt(process.env.WEB_PORT ?? "4020", 10)
  const uiPath = path.resolve(process.cwd(), process.env.UI_PATH ?? "./ui")
  const localLlmTimeoutMs = Number.parseInt(process.env.LOCAL_LLM_TIMEOUT_MS ?? "180000", 10)
  const localLlmMaxTokens = Number.parseInt(process.env.LOCAL_LLM_MAX_TOKENS ?? "4096", 10)

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
    webHost,
    webPort,
    uiPath,
    localLlm: {
      baseUrl: process.env.LOCAL_LLM_BASE_URL ?? "http://127.0.0.1:1234/v1",
      apiKey: process.env.LOCAL_LLM_API_KEY ?? "local",
      model: process.env.LOCAL_LLM_MODEL ?? "qwen/qwen3.5-9b",
      timeoutMs: Number.isFinite(localLlmTimeoutMs) ? localLlmTimeoutMs : 180000,
      maxTokens: Number.isFinite(localLlmMaxTokens) ? localLlmMaxTokens : 4096,
    },
  }
}
