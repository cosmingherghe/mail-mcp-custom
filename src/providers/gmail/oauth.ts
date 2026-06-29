import http from "node:http"

import express from "express"
import open from "open"
import { google } from "googleapis"

import type { AppConfig } from "../../config.js"
import { readToken, writeToken } from "./token-store.js"

export type GoogleOAuthClient = InstanceType<typeof google.auth.OAuth2>

export function createOAuthClient(config: AppConfig): GoogleOAuthClient {
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri)
}

export async function authorize(config: AppConfig): Promise<GoogleOAuthClient> {
  const client = createOAuthClient(config)
  const savedToken = await readToken(config.tokenPath)

  if (savedToken) {
    client.setCredentials(savedToken)
    return client
  }

  return runLocalAuthFlow(client, config)
}

async function runLocalAuthFlow(client: GoogleOAuthClient, config: AppConfig): Promise<GoogleOAuthClient> {
  const app = express()

  const codePromise = new Promise<string>((resolve, reject) => {
    app.get("/oauth/callback", (request, response) => {
      const code = request.query.code
      const error = request.query.error

      if (typeof error === "string") {
        response.status(400).send(`OAuth failed: ${error}`)
        reject(new Error(`OAuth failed: ${error}`))
        return
      }

      if (typeof code !== "string") {
        response.status(400).send("Missing OAuth code")
        reject(new Error("Missing OAuth code"))
        return
      }

      response.send("Gmail auth complete. You can close this tab and return to the terminal.")
      resolve(code)
    })
  })

  const server = await new Promise<http.Server>((resolve, reject) => {
    const instance = app.listen(config.oauthPort, "127.0.0.1", () => resolve(instance))
    instance.on("error", reject)
  })

  try {
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: config.scopes,
    })

    await open(authUrl)
    const code = await codePromise
    const tokenResponse = await client.getToken(code)

    if (!tokenResponse.tokens.refresh_token && !tokenResponse.tokens.access_token) {
      throw new Error("Google OAuth did not return tokens")
    }

    client.setCredentials(tokenResponse.tokens)
    await writeToken(config.tokenPath, tokenResponse.tokens)
    return client
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}
