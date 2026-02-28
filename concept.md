# GTM Lead Sourcing Agent — Architecture

> Chat-based lead sourcing agents. No signup. Create agents, talk to them, get leads.

---

## 1. What This Is

Users create lead sourcing agents via a simple UI, then chat with them to find leads. Each agent has an ICP and memory. No accounts — session-based.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────────────────────────────┐
│   User       │     │  Next.js Frontend (Vercel)           │
│   Browser    │────▶│  • Agent creation UI                 │
│              │◀────│  • Chat interface per agent           │
│              │     │  • Lead results table + export        │
│              │     │  • pi-agent-core Agent (client-side)  │
└──────────────┘     └──────────────┬───────────────────────┘
                                    │ streamProxy()
                     ┌──────────────▼───────────────────────┐
                     │     Next.js API Routes (Vercel)       │
                     │  • /api/stream — LLM proxy (pi-ai)    │
                     │  • /api/tools/web-search — Tavily     │
                     │  • /api/tools/web-fetch — URL scraper │
                     └──────┬───────────────┬───────────────┘
                            │               │
                      ┌─────▼─────┐   ┌─────▼─────┐
                      │ Tavily    │   │ LLM API   │
                      │ (search)  │   │ (our key) │
                      └───────────┘   └───────────┘

Agent runtime: pi-agent-core (runs in browser)
LLM calls: proxied through /api/stream (hides API keys)
Tools: call server endpoints for external APIs
Storage: localStorage (agents, chat history, leads)
```

The Agent runs client-side using `@mariozechner/pi-agent-core`. LLM calls are proxied through our server to hide API keys. Tools call server endpoints for Tavily/scraping so those keys stay server-side too.

---

## 3. User Flow

```
1. Land on page → see empty agent list
2. Click "Create Agent"
   → Name: "DACH SaaS Hunter"
   → ICP: "Series A B2B SaaS founders in DACH, 10-50 employees"
   → Agent created (saved to localStorage)
3. Click into agent → chat opens
4. Agent greets: "I'm set up to find Series A B2B SaaS leads in DACH.
   Want me to start sourcing, or refine the profile first?"
5. User: "Find me 20 leads"
6. Agent searches, extracts, scores → streams results into chat
7. Leads also appear in a side panel table
8. User: "Focus more on Munich area" → agent adjusts, searches again
9. Export CSV anytime
```

---

## 4. Data Model (All localStorage)

```typescript
// App-level types
type AgentConfig = {
  id: string;
  name: string;
  icp: string;              // Free-text ICP description
  createdAt: number;
}

type Lead = {
  name: string;
  title: string;
  company: string;
  website?: string;
  linkedin?: string;
  score: number;            // 0-100
  reason: string;
  source: string;
}

// Messages use pi-agent-core's AgentMessage type directly.
// Leads are extracted from tool result `details` — no custom
// message parsing needed.
```

---

## 5. Agent Setup (Client-Side)

```typescript
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel, Type } from "@mariozechner/pi-ai";
import { streamProxy } from "@mariozechner/pi-agent-core";

function createLeadAgent(icp: string) {
  const agent = new Agent({
    initialState: {
      systemPrompt: buildSystemPrompt(icp),
      model: getModel("anthropic", "claude-sonnet-4-20250514"),
      thinkingLevel: "off",
      tools: [webSearchTool, webFetchTool],
    },
    streamFn: (model, context, options) =>
      streamProxy(model, context, {
        ...options,
        proxyUrl: "/api/stream",
      }),
  });

  return agent;
}
```

The Agent runs in the browser. All LLM calls go through `/api/stream` via `streamProxy()` so our API key stays server-side.

---

## 6. Agent System Prompt

```
You are a GTM lead sourcing agent. Your job is to find qualified
sales leads based on the user's Ideal Customer Profile (ICP).

ICP: {agent.icp}

You have these tools:
- web_search: Search the web for companies and people
- web_fetch: Scrape a specific URL for details

When the user asks you to find leads:
1. Generate smart search queries from the ICP
2. Search and extract lead information
3. Score each lead 0-100 against the ICP
4. Present results conversationally — the tools handle structured data

You can also have normal conversations — help the user refine
their ICP, discuss strategy, answer questions about the leads.
```

No more `[LEADS_START]...[LEADS_END]` parsing. Leads are returned as structured data in tool result `details`, which the UI reads directly from agent events.

---

## 7. Tools (pi-agent-core AgentTools)

Tools execute client-side but call server endpoints for external APIs.

```typescript
import { Type } from "@mariozechner/pi-ai";
import type { AgentTool } from "@mariozechner/pi-agent-core";

const webSearchTool: AgentTool<typeof webSearchParams> = {
  name: "web_search",
  label: "Web Search",
  description: "Search the web. Use to find companies, people, funding rounds.",
  parameters: Type.Object({
    query: Type.String({ description: "Search query" }),
  }),
  execute: async (toolCallId, params, signal) => {
    const res = await fetch("/api/tools/web-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: params.query }),
      signal,
    });
    const data = await res.json();

    return {
      content: [{ type: "text", text: JSON.stringify(data.results) }],
      details: { query: params.query, resultCount: data.results.length },
    };
  },
};

const webFetchTool: AgentTool<typeof webFetchParams> = {
  name: "web_fetch",
  label: "Web Fetch",
  description: "Fetch and extract content from a URL.",
  parameters: Type.Object({
    url: Type.String({ description: "URL to fetch" }),
  }),
  execute: async (toolCallId, params, signal) => {
    const res = await fetch("/api/tools/web-fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: params.url }),
      signal,
    });
    const data = await res.json();

    return {
      content: [{ type: "text", text: data.text }],
      details: { url: params.url },
    };
  },
};
```

`content` goes to the LLM. `details` goes to the UI. Clean separation.

---

## 8. API Routes

### `POST /api/stream` — LLM Proxy

Proxies LLM requests from the client-side Agent to the provider API. Injects our API key server-side.

```typescript
// Uses pi-agent-core's proxy protocol
// Client sends: model, messages, tools, options
// Server adds: API key, forwards to LLM provider
// Server returns: newline-delimited JSON event stream
```

### `POST /api/tools/web-search`

```typescript
// Input: { query: string }
// Calls Tavily API with our key
// Output: { results: TavilyResult[] }
```

### `POST /api/tools/web-fetch`

```typescript
// Input: { url: string }
// Fetches URL, extracts text content
// Output: { text: string }
```

All API keys (LLM, Tavily) live server-side only.

---

## 9. Frontend Event Handling

The UI subscribes to pi-agent-core's event system for reactive updates:

```typescript
agent.subscribe((event) => {
  switch (event.type) {
    case "message_start":
      // New message — add to chat UI
      break;
    case "message_update":
      // Streaming delta — update current message in real-time
      break;
    case "message_end":
      // Message complete — finalize in chat, persist to localStorage
      break;
    case "tool_execution_start":
      // Show "Searching..." indicator in chat
      break;
    case "tool_execution_end":
      // Tool done — extract leads from details if applicable
      break;
    case "agent_end":
      // Full turn complete — save conversation state
      break;
  }
});

// Prompt the agent
await agent.prompt("Find me 20 leads in DACH");

// User can steer mid-execution
agent.steer({ role: "user", content: [...], timestamp: Date.now() });

// Or abort
agent.abort();
```

Steering lets users redirect the agent mid-search (e.g. "stop, focus on Munich instead") without waiting for the full tool loop to finish.

---

## 10. Frontend (2 Screens)

### Agents List (`/`)

```
┌─────────────────────────────────────────────┐
│  Lead Agents                   [+ New Agent]│
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ DACH SaaS Hunter                    │    │
│  │ Series A B2B SaaS in DACH...        │    │
│  │ 47 leads found                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ US Fintech Finder                   │    │
│  │ Seed-stage fintech startups...      │    │
│  │ 12 leads found                      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Agent Chat (`/agent/[id]`)

```
┌──────────────────────────┬──────────────────┐
│  DACH SaaS Hunter        │  Leads (47)      │
│                          │                  │
│  Agent: I found 15 leads │  Score | Company  │
│  matching your ICP.      │  ------+-------- │
│  Top match: DataPilot    │  92    | DataPilot│
│  (Series A, Munich, 30   │  87    | CloudBase│
│  employees).             │  81    | FlowHQ   │
│                          │  ...   | ...      │
│  You: Focus on companies │                  │
│  using React in their    │  [Export CSV]     │
│  stack                   │                  │
│                          │                  │
│  Agent: Searching for    │                  │
│  React SaaS in DACH      │                  │
│  [web_search running...] │                  │
│                          │                  │
│  ┌────────────────────┐  │                  │
│  │ Message...    [Send]│  │                  │
│  └────────────────────┘  │                  │
└──────────────────────────┴──────────────────┘
```

Split view: chat on left, accumulated leads on right. Leads persist across the conversation.

---

## 11. Dependencies

```json
{
  "dependencies": {
    "@mariozechner/pi-agent-core": "^0.55",
    "@mariozechner/pi-ai": "^0.55",
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  }
}
```

pi-agent-core gives us: agent loop, tool execution, event streaming, message management, abort/steering, proxy support. We don't build any of that ourselves.

---

## 12. MVP Scope (3-4 Days)

**Day 1: Backend + Agent Wiring**
- [ ] `/api/stream` LLM proxy endpoint
- [ ] `/api/tools/web-search` (Tavily)
- [ ] `/api/tools/web-fetch` (URL scraper)
- [ ] Agent setup with pi-agent-core (model, tools, system prompt)

**Day 2: Frontend — Agent CRUD**
- [ ] Agent list page (localStorage)
- [ ] Create agent modal (name + ICP)
- [ ] Edit / delete agent

**Day 3: Frontend — Chat + Leads**
- [ ] Chat UI driven by agent event subscription
- [ ] Streaming message display
- [ ] Tool call indicators (searching...)
- [ ] Lead panel (right side) + CSV export
- [ ] Abort / steer support

**Day 4: Polish**
- [ ] Rate limiting (IP-based on proxy endpoint)
- [ ] Error handling
- [ ] Mobile responsive
- [ ] Landing hero section above agent list
- [ ] Deploy

---

## 13. Cost & Limits

| Per chat turn with sourcing | ~$0.10-0.20 |
|---|---|
| Tavily searches (3-5 per turn) | ~$0.03-0.05 |
| LLM (query gen + extraction + scoring) | ~$0.05-0.15 |

Rate limit: 10 sourcing runs/hour per IP. Enough to try it, not enough to abuse.

---

## 14. Later (Only If Traction)

- Accounts + persistence (Convex)
- Recurring daily sourcing (cron)
- Email enrichment (Hunter.io / Apollo)
- CRM integrations
- Stripe billing
- Thinking mode for complex ICP analysis (`agent.setThinkingLevel("medium")`)
