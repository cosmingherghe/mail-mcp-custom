# OpenCode Configuration

Use this local `opencode.json` configuration to run the mail MCP server from OpenCode. The current provider is Gmail:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "gmail-custom": {
      "type": "local",
      "command": ["npm", "run", "dev"],
      "cwd": "E:\\Projects\\Git_Projects\\mail-mcp-custom",
      "enabled": true
    }
  }
}
```

## Notes

1. `cwd` must point to the local checkout of this project.
2. The server is started with `npm run dev`.
3. On first run, Google OAuth opens in the browser and stores tokens in `data/gmail-token.json`.
