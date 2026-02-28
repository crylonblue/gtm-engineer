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
└──────────────┘     └──────────────┬───────────────────────┘
                                    │
                     ┌──────────────▼───────────────────────┐
                     │     Next.js API Routes (Vercel)       │
                     │  • /api/chat — agent conversation     │
                     │  • /api/agents — CRUD                 │
                     │  • Tool execution (search, extract)   │
                     └──────┬───────────────┬───────────────┘
                            │               │
                      ┌─────▼─────┐   ┌─────▼─────┐
                      │ Tavily    │   │ LLM API   │
                      │ (search)  │   │ (our key) │
                      └───────────┘   └───────────┘

Storage: localStorage (agents, chat history, leads)
```

No auth. No database. Everything in the browser. Our LLM key on the server.

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
type Agent = {
  id: string;
  name: string;
  icp: string;              // Free-text ICP description
  createdAt: number;
}

type Message = {
  id: string;
  agentId: string;
  role: "user" | "assistant";
  content: string;
  leads?: Lead[];           // Attached leads (if sourcing result)
  timestamp: number;
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
```

---

## 5. Agent System Prompt

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
4. Present results in a structured format

When presenting leads, use this JSON format in your response:
[LEADS_START]
[{name, title, company, website, linkedin, score, reason}]
[LEADS_END]

You can also have normal conversations — help the user refine 
their ICP, discuss strategy, answer questions about the leads.
```

---

## 6. API Routes

### `POST /api/chat`

```typescript
// Input
{ 
  agentId: string,
  messages: Message[],     // Full conversation history
  icp: string              // Agent's ICP
}

// Process
// 1. Build system prompt with ICP
// 2. Call LLM with tool-use loop (web_search, web_fetch)
// 3. Stream response back
// 4. Parse any [LEADS_START]...[LEADS_END] blocks

// Output (streamed)
{ content: string, leads?: Lead[] }
```

### `POST /api/agents` (optional — could be pure client-side)

Only needed if we want server-side validation. Otherwise agents are purely localStorage.

---

## 7. Tools (In the LLM Loop)

```typescript
const tools = [
  {
    name: "web_search",
    description: "Search the web. Use to find companies, people, funding rounds.",
    params: { query: "string" },
    execute: async (query) => tavily.search(query)
  },
  {
    name: "web_fetch",
    description: "Fetch and extract content from a URL.",
    params: { url: "string" },
    execute: async (url) => fetch(url).then(extractText)
  }
];
```

Two tools. The LLM does the heavy lifting — deciding what to search, how to extract leads, how to score them.

---

## 8. Frontend (2 Screens)

### Agents List (`/`)

```
┌─────────────────────────────────────────────┐
│  🎯 Lead Agents                [+ New Agent]│
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🟢 DACH SaaS Hunter                │    │
│  │ Series A B2B SaaS in DACH...        │    │
│  │ 47 leads found                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🟢 US Fintech Finder               │    │
│  │ Seed-stage fintech startups...      │    │
│  │ 12 leads found                      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Agent Chat (`/agent/[id]`)

```
┌──────────────────────────┬──────────────────┐
│  💬 DACH SaaS Hunter     │  📋 Leads (47)   │
│                          │                  │
│  🤖 I found 15 leads    │  Score │ Company  │
│  matching your ICP.      │  ──────┼──────── │
│  Top match: DataPilot    │  92    │ DataPilot│
│  (Series A, Munich, 30   │  87    │ CloudBase│
│  employees).             │  81    │ FlowHQ   │
│                          │  ...   │ ...      │
│  👤 Focus on companies   │                  │
│  using React in their    │  [Export CSV]     │
│  stack                   │                  │
│                          │                  │
│  🤖 Searching for React  │                  │
│  SaaS companies in DACH  │                  │
│  🔍 web_search...        │                  │
│                          │                  │
│  ┌────────────────────┐  │                  │
│  │ Message...    [Send]│  │                  │
│  └────────────────────┘  │                  │
└──────────────────────────┴──────────────────┘
```

Split view: chat on left, accumulated leads on right. Leads persist across the conversation.

---

## 9. MVP Scope (3-4 Days)

**Day 1: Backend**
- [ ] `/api/chat` route with LLM tool-use loop
- [ ] web_search (Tavily) + web_fetch tools
- [ ] Streaming response
- [ ] Lead extraction from LLM output

**Day 2: Frontend — Agent CRUD**
- [ ] Agent list page (localStorage)
- [ ] Create agent modal (name + ICP)
- [ ] Edit / delete agent

**Day 3: Frontend — Chat + Leads**
- [ ] Chat UI with streaming
- [ ] Tool call display (searching...)
- [ ] Lead panel (right side)
- [ ] CSV export

**Day 4: Polish**
- [ ] Rate limiting (IP-based)
- [ ] Error handling
- [ ] Mobile responsive
- [ ] Landing hero section above agent list
- [ ] Deploy

---

## 10. Cost & Limits

| Per chat turn with sourcing | ~$0.10-0.20 |
|---|---|
| Tavily searches (3-5 per turn) | ~$0.03-0.05 |
| LLM (query gen + extraction + scoring) | ~$0.05-0.15 |

Rate limit: 10 sourcing runs/hour per IP. Enough to try it, not enough to abuse.

---

## 11. Later (Only If Traction)

- Accounts + persistence (Convex)
- Recurring daily sourcing (cron)
- Email enrichment (Hunter.io / Apollo)
- CRM integrations
- Stripe billing
