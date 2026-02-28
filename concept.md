# GTM Lead Sourcing Agent — Architecture

> Standalone agent server for lead sourcing. Deployed on fly.io, consumed via HTTP API.

---

## 1. What This Is

A standalone GTM lead sourcing agent that runs server-side as a Hono HTTP service. It exposes an SSE-based chat API that can be embedded into any SaaS frontend. No UI — pure agent service.

The agent sources leads using two integrated services:
- **BuiltWith** — Find companies by tech stack (direct API)
- **LinkedIn Sales Navigator** — Find decision-makers via Unipile API

A third tool slot is reserved for future enrichment.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────────────────────────────┐
│   SaaS       │     │  GTM Agent Server (fly.io)           │
│   Frontend   │────▶│  • Hono HTTP server                  │
│   (any)      │◀────│  • POST /chat → SSE stream           │
│              │     │  • pi-agent-core agentLoop            │
│              │     │  • In-memory session store            │
└──────────────┘     └──────────────┬───────────────────────┘
                                    │ Tool calls
                     ┌──────────────▼───────────────────────┐
                     │     External APIs                     │
                     │  • BuiltWith (tech stack lookup)      │
                     │  • Unipile (LinkedIn Sales Nav)       │
                     └───┬──────────┬───────────────────────┘
                         │          │
                  ┌──────▼──┐ ┌────▼────────┐
                  │BuiltWith│ │   Unipile   │
                  │  API    │ │  (LinkedIn   │
                  │         │ │  Sales Nav)  │
                  └─────────┘ └─────────────┘
                                   ┌───────────┐
                                   │  Anthropic │
                                   │  API       │
                                   └───────────┘

Agent runtime: pi-agent-core agentLoop (server-side)
LLM calls: direct to Anthropic API via pi-ai
Tools: server-side, call BuiltWith + Unipile directly
Sessions: in-memory with 1-hour TTL
```

---

## 3. API

### `GET /health`
Returns `{ "status": "ok" }`.

### `POST /chat`
SSE streaming endpoint.

**Request:**
```json
{
  "message": "Find me 10 SaaS companies using Stripe in Germany",
  "agentId": "optional-existing-session-id"
}
```

**SSE Events:**
- `text_delta` — `{ type: "text_delta", text: "..." }`
- `tool_start` — `{ type: "tool_start", toolName: "builtwith_lookup", args: {...} }`
- `tool_end` — `{ type: "tool_end", toolName: "builtwith_lookup", result: "...", isError: false }`
- `done` — `{ type: "done", agentId: "uuid" }`
- `error` — `{ type: "error", message: "..." }`

Reuse `agentId` from `done` events for multi-turn conversations.

---

## 4. Data Model

```typescript
type Lead = {
  name: string;
  title: string;
  company: string;
  website?: string;
  linkedin?: string;
  email?: string;
  techStack?: string[];
  score: number;
  reason: string;
  source: string;
}

type SessionState = {
  id: string;
  messages: AgentMessage[];
  createdAt: number;
  lastActivity: number;
}
```

---

## 5. Tools

### `builtwith_lookup`
Find companies by technology stack via BuiltWith API.
- Params: `{ technology: string, country?: string }`
- Returns: list of companies with their tech stacks

### `linkedin_sales_nav`
Search LinkedIn Sales Navigator via Unipile.
- Params: `{ query: string, category?: "people"|"companies", filters?: {...} }`
- Returns: list of people/companies matching criteria

---

## 6. Deployment

Deployed on fly.io (Frankfurt region):
- Auto-stop when idle, auto-start on request
- Health check on `/health`
- Env vars set via `fly secrets`

---

## 7. Dependencies

```json
{
  "@mariozechner/pi-agent-core": "^0.55",
  "@mariozechner/pi-ai": "^0.55",
  "@sinclair/typebox": "^0.34",
  "hono": "^4.7",
  "@hono/node-server": "^1.13"
}
```
