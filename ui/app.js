const state = {
  messages: [],
  selectedId: null,
}

const messageList = document.querySelector("#messageList")
const messageCount = document.querySelector("#messageCount")
const readerContent = document.querySelector("#readerContent")
const trashButton = document.querySelector("#trashButton")
const statusLine = document.querySelector("#status")
const queryInput = document.querySelector("#queryInput")
const maxResultsInput = document.querySelector("#maxResultsInput")
const summaryProviderInput = document.querySelector("#summaryProviderInput")

document.querySelector("#refreshButton").addEventListener("click", () => loadMessages())
document.querySelector("#searchButton").addEventListener("click", () => loadMessages())
document.querySelector("#todaySummaryButton").addEventListener("click", summarizeTodayEmails)
document.querySelector("#sendForm").addEventListener("submit", sendEmailFromForm)
trashButton.addEventListener("click", trashSelectedEmail)

loadMessages()

async function loadMessages() {
  setStatus("Loading messages...")

  const params = new URLSearchParams({ maxResults: maxResultsInput.value || "10" })
  if (queryInput.value.trim()) params.set("query", queryInput.value.trim())

  const data = await api(`/api/emails?${params.toString()}`)
  state.messages = data.messages || []
  state.selectedId = null
  renderMessages()
  renderEmptyReader()
  setStatus(`Loaded ${state.messages.length} message(s).`)
}

async function openMessage(id) {
  setStatus("Reading message...")
  state.selectedId = id
  renderMessages()

  const message = await api(`/api/emails/${encodeURIComponent(id)}`)
  trashButton.disabled = false
  readerContent.classList.remove("empty")
  readerContent.innerHTML = `
    <div class="meta">
      <strong>${escapeHtml(message.subject || "(no subject)")}</strong>
      <span>From: ${escapeHtml(message.from || "Unknown")}</span>
      <span>To: ${escapeHtml(message.to || "Unknown")}</span>
      <span>Date: ${escapeHtml(message.date || "Unknown")}</span>
      <span>ID: ${escapeHtml(message.id || id)}</span>
    </div>
    <div>${escapeHtml(message.body || message.snippet || "No plain text body found.")}</div>
  `
  setStatus("Message loaded.")
}

async function sendEmailFromForm(event) {
  event.preventDefault()
  setStatus("Sending email...")

  const form = new FormData(event.currentTarget)
  const body = Object.fromEntries(form.entries())
  const result = await api("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  event.currentTarget.reset()
  setStatus(`Sent email ${result.id || "successfully"}.`)
}

async function trashSelectedEmail() {
  if (!state.selectedId) return

  const confirmed = window.confirm("Move this message to Gmail Trash? You can recover it from Trash in Gmail.")
  if (!confirmed) return

  setStatus("Moving message to trash...")
  await api(`/api/emails/${encodeURIComponent(state.selectedId)}/trash`, { method: "POST" })
  setStatus("Message moved to trash.")
  await loadMessages()
}

async function summarizeTodayEmails() {
  setStatus("Summarizing today's emails with local AI...")
  trashButton.disabled = true

  const result = await api("/api/summaries/today", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: summaryProviderInput.value,
      maxResults: maxResultsInput.value || "10",
    }),
  })

  state.messages = result.messages || []
  state.selectedId = null
  queryInput.value = result.query || ""
  renderMessages()
  renderSummary(result)
  setStatus(`Summarized ${state.messages.length} email(s) received today.`)
}

function renderMessages() {
  messageCount.textContent = String(state.messages.length)
  messageList.innerHTML = ""

  if (state.messages.length === 0) {
    messageList.innerHTML = `<p class="hint">No messages found.</p>`
    return
  }

  for (const message of state.messages) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = `message-card${message.id === state.selectedId ? " active" : ""}`
    button.innerHTML = `
      <strong>${escapeHtml(message.threadId || "Message")}</strong>
      <div class="message-id">${escapeHtml(message.id || "")}</div>
    `
    button.addEventListener("click", () => openMessage(message.id))
    messageList.append(button)
  }
}

function renderEmptyReader() {
  trashButton.disabled = true
  readerContent.classList.add("empty")
  readerContent.textContent = "Select a message to read it."
}

function renderSummary(result) {
  readerContent.classList.remove("empty")
  readerContent.innerHTML = `
    <div class="meta">
      <strong>Today's Email Summary</strong>
      <span>Provider: ${escapeHtml(result.provider || "local_llm")}</span>
      <span>Query: ${escapeHtml(result.query || "")}</span>
      <span>Messages: ${escapeHtml(String((result.messages || []).length))}</span>
    </div>
    <div class="summary-content">${escapeHtml(result.summary || "No summary returned.")}</div>
  `
}

async function api(path, options) {
  const response = await fetch(path, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.error || `Request failed with ${response.status}`
    setStatus(message)
    throw new Error(message)
  }

  return data
}

function setStatus(message) {
  statusLine.textContent = message
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
