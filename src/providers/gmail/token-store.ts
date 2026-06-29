import fs from "node:fs/promises"
import path from "node:path"

import type { Credentials } from "google-auth-library"

export async function readToken(filePath: string): Promise<Credentials | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return JSON.parse(raw) as Credentials
  } catch (error) {
    const maybeCode = (error as NodeJS.ErrnoException).code
    if (maybeCode === "ENOENT") return null
    throw error
  }
}

export async function writeToken(filePath: string, token: Credentials): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(token, null, 2)}\n`, "utf8")
}
