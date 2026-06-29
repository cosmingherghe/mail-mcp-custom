export type OpenAiCompatibleConfig = {
  baseUrl: string
  apiKey: string
  model: string
  timeoutMs: number
  maxTokens: number
}

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export async function createChatCompletion(config: OpenAiCompatibleConfig, messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.2,
        max_tokens: config.maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    })

    const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse & { error?: { message?: string } }

    if (!response.ok) {
      throw new Error(data.error?.message ?? `Local LLM request failed with ${response.status}`)
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error("Local LLM returned an empty response")
    }

    return content
  } finally {
    clearTimeout(timeout)
  }
}
