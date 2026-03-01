"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Linkedin,
  Mail,
  Building2,
  Send,
  Search,
  UserPlus,
  UserMinus,
  Users,
  MessageSquare,
  Heart,
  Play,
  Pause,
  BarChart3,
  Globe,
  ExternalLink,
  Database,
  Sparkles,
  Upload,
  Download,
  FolderOpen,
  StickyNote,
  Handshake,
  User,
  Inbox,
  Zap,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Integration & action data                                         */
/* ------------------------------------------------------------------ */

interface Action {
  name: string;
  description: string;
  icon: LucideIcon;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  logo?: () => React.ReactNode;
  actions: Action[];
}

/* ---------- tiny SVG brand marks ---------- */

function LinkedInLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GmailLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28}>
      <path fill="#4285F4" d="M22 6v12c0 1.1-.9 2-2 2h-1V9.72L12 14 5 9.72V20H4c-1.1 0-2-.9-2-2V6c0-.55.22-1.05.59-1.41C2.95 4.22 3.45 4 4 4h.5l7.5 5.5L19.5 4H20c.55 0 1.05.22 1.41.59.37.36.59.86.59 1.41z" />
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="#FF7A59">
      <path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.984v-.066A2.2 2.2 0 0 0 17.23.833h-.066a2.2 2.2 0 0 0-2.2 2.2v.067c0 .86.5 1.6 1.222 1.963V7.93a5.352 5.352 0 0 0-2.593 1.14L6.06 3.572a2.348 2.348 0 0 0 .07-.56A2.353 2.353 0 1 0 3.776 5.36c.493 0 .943-.16 1.315-.425l7.42 5.418a5.39 5.39 0 0 0-.153 6.378l-2.27 2.27a2.092 2.092 0 0 0-.614-.103 2.12 2.12 0 1 0 2.12 2.12c0-.217-.04-.424-.103-.614l2.244-2.245a5.372 5.372 0 1 0 4.43-10.229zm-.977 7.6a2.324 2.324 0 1 1 0-4.648 2.324 2.324 0 0 1 0 4.648z" />
    </svg>
  );
}

function LemlistLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28}>
      <rect width="24" height="24" rx="5" fill="#4F46E5" />
      <path d="M7 7h3v10H7V7zm4 4h3v6h-3v-6zm4-2h3v8h-3V9z" fill="white" />
    </svg>
  );
}

function ProspeoLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28}>
      <rect width="24" height="24" rx="5" fill="#6366F1" />
      <circle cx="12" cy="10" r="4" fill="white" opacity="0.9" />
      <path d="M6 19c0-3.31 2.69-6 6-6s6 2.69 6 6" fill="white" opacity="0.7" />
    </svg>
  );
}

function ExaLogo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28}>
      <rect width="24" height="24" rx="5" fill="#10B981" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2" />
      <line x1="16" y1="16" x2="20" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- integration definitions ---------- */

const integrations: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Social selling, messaging, and lead engagement on LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
    logo: LinkedInLogo,
    actions: [
      { name: "Search People", description: "Search for people on LinkedIn by keywords, title, company, or location", icon: Search },
      { name: "Search Companies", description: "Search for companies on LinkedIn", icon: Search },
      { name: "Get Profile", description: "Retrieve a person's full LinkedIn profile", icon: User },
      { name: "Get Company Profile", description: "Retrieve a company's full LinkedIn profile", icon: Building2 },
      { name: "Send Message", description: "Send a direct message to a LinkedIn connection", icon: Send },
      { name: "Start Chat", description: "Start a new chat conversation with a connection", icon: MessageSquare },
      { name: "List Chats", description: "List all your LinkedIn chat conversations", icon: MessageSquare },
      { name: "Get Chat Messages", description: "Retrieve messages from a specific chat", icon: MessageSquare },
      { name: "Send Invitation", description: "Send a connection request with an optional note", icon: UserPlus },
      { name: "List Invitations Sent", description: "View all pending connection requests you've sent", icon: Users },
      { name: "Create Post", description: "Publish a new post on your LinkedIn feed", icon: Send },
      { name: "Send Comment", description: "Comment on a LinkedIn post", icon: MessageSquare },
      { name: "Send Reaction", description: "React to a LinkedIn post (like, celebrate, etc.)", icon: Heart },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Send, search, and manage emails through Gmail",
    icon: Inbox,
    color: "text-[#EA4335]",
    bgColor: "bg-[#EA4335]/10",
    logo: GmailLogo,
    actions: [
      { name: "List Emails", description: "List emails from your inbox with filters", icon: Inbox },
      { name: "Get Email", description: "Read a specific email by ID", icon: Mail },
      { name: "Send Email", description: "Compose and send a new email", icon: Send },
      { name: "Search Emails", description: "Search emails by query, sender, date, and more", icon: Search },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM operations — contacts, companies, deals, and notes",
    icon: Building2,
    color: "text-[#FF7A59]",
    bgColor: "bg-[#FF7A59]/10",
    logo: HubSpotLogo,
    actions: [
      { name: "Search Contacts", description: "Search CRM contacts by name, email, or custom filters", icon: Search },
      { name: "Get Contact", description: "Retrieve a contact by ID", icon: User },
      { name: "Create Contact", description: "Create a new contact in HubSpot CRM", icon: UserPlus },
      { name: "Update Contact", description: "Update an existing contact's properties", icon: User },
      { name: "Search Companies", description: "Search for companies in HubSpot", icon: Search },
      { name: "Get Company", description: "Retrieve a company by ID", icon: Building2 },
      { name: "Create Company", description: "Create a new company record", icon: Building2 },
      { name: "Update Company", description: "Update an existing company's properties", icon: Building2 },
      { name: "Search Deals", description: "Search for deals in the pipeline", icon: Search },
      { name: "Get Deal", description: "Retrieve a deal by ID", icon: Handshake },
      { name: "Create Deal", description: "Create a new deal in the pipeline", icon: Handshake },
      { name: "Update Deal", description: "Update an existing deal's properties", icon: Handshake },
      { name: "Create Note", description: "Add a note to a contact, company, or deal", icon: StickyNote },
      { name: "Add to List", description: "Add a contact to a HubSpot list", icon: Users },
    ],
  },
  {
    id: "lemlist",
    name: "Lemlist",
    description: "Email outreach campaigns, lead management, and activity tracking",
    icon: Mail,
    color: "text-[#4F46E5]",
    bgColor: "bg-[#4F46E5]/10",
    logo: LemlistLogo,
    actions: [
      { name: "List Campaigns", description: "List all email outreach campaigns", icon: Mail },
      { name: "Get Campaign", description: "Get details of a specific campaign", icon: Mail },
      { name: "Get Campaign Stats", description: "View open rates, click rates, and reply stats", icon: BarChart3 },
      { name: "Start Campaign", description: "Activate a paused campaign", icon: Play },
      { name: "Pause Campaign", description: "Pause a running campaign", icon: Pause },
      { name: "List Campaign Leads", description: "List all leads in a specific campaign", icon: Users },
      { name: "Create Lead", description: "Add a new lead to a campaign", icon: UserPlus },
      { name: "Get Lead", description: "Retrieve a lead's details from a campaign", icon: User },
      { name: "Update Lead", description: "Update a lead's information", icon: User },
      { name: "Delete Lead", description: "Remove a lead from a campaign", icon: UserMinus },
      { name: "Mark Lead Interested", description: "Flag a lead as interested", icon: Heart },
      { name: "Mark Lead Not Interested", description: "Flag a lead as not interested", icon: UserMinus },
      { name: "List Activities", description: "View recent campaign activities and events", icon: Zap },
      { name: "List Unsubscribes", description: "View leads who have unsubscribed", icon: UserMinus },
      { name: "Add Unsubscribe", description: "Manually add an email to the unsubscribe list", icon: UserMinus },
    ],
  },
  {
    id: "prospeo",
    name: "Prospeo",
    description: "B2B data enrichment — find emails, phone numbers, and company data",
    icon: Sparkles,
    color: "text-[#6366F1]",
    bgColor: "bg-[#6366F1]/10",
    logo: ProspeoLogo,
    actions: [
      { name: "Enrich Person", description: "Find email and contact data for a person", icon: User },
      { name: "Bulk Enrich People", description: "Enrich multiple people at once", icon: Users },
      { name: "Enrich Company", description: "Get detailed data about a company", icon: Building2 },
      { name: "Bulk Enrich Companies", description: "Enrich multiple companies at once", icon: Building2 },
      { name: "Search Person", description: "Search for a person by name and company", icon: Search },
      { name: "Search Company", description: "Search for a company by name or domain", icon: Search },
      { name: "Search Suggestions", description: "Get auto-complete suggestions for searches", icon: Search },
      { name: "Account Info", description: "View your Prospeo account usage and limits", icon: User },
    ],
  },
  {
    id: "exa",
    name: "Exa",
    description: "AI-powered web search for real-time information",
    icon: Globe,
    color: "text-[#10B981]",
    bgColor: "bg-[#10B981]/10",
    logo: ExaLogo,
    actions: [
      { name: "Web Search", description: "Search the web for up-to-date information using AI-powered search", icon: Globe },
    ],
  },
  {
    id: "leads",
    name: "Leads Database",
    description: "Internal lead database — store, search, and manage your leads",
    icon: Database,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    actions: [
      { name: "Add Lead", description: "Add a new lead to the database", icon: UserPlus },
      { name: "Add Leads (Bulk)", description: "Import multiple leads at once", icon: Users },
      { name: "Get Lead", description: "Retrieve a lead by ID", icon: User },
      { name: "Update Lead", description: "Update a lead's information", icon: User },
      { name: "Search Leads", description: "Search leads by name, company, email, and more", icon: Search },
      { name: "List Leads", description: "List all leads with pagination", icon: Database },
      { name: "Delete Lead", description: "Remove a lead from the database", icon: UserMinus },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    description: "File storage — save, retrieve, and list files and data",
    icon: FolderOpen,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    actions: [
      { name: "Save File", description: "Save content to a file in storage", icon: Upload },
      { name: "Get File", description: "Retrieve a file's contents from storage", icon: Download },
      { name: "List Files", description: "List all files in storage with optional prefix filter", icon: FolderOpen },
    ],
  },
  {
    id: "builtin",
    name: "Web Fetch",
    description: "Fetch and extract content from any URL on the web",
    icon: ExternalLink,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    actions: [
      { name: "Web Fetch", description: "Fetch content from a URL and extract relevant information", icon: ExternalLink },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <Card
      className="rounded-none cursor-pointer hover:bg-muted/40 transition-colors group"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${integration.bgColor} shrink-0`}>
            {integration.logo ? (
              integration.logo()
            ) : (
              <integration.icon size={28} className={integration.color} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{integration.name}</h3>
              <ChevronRight
                size={16}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {integration.description}
            </p>
            <Badge variant="secondary" className="text-[10px] mt-2">
              {integration.actions.length}{" "}
              {integration.actions.length === 1 ? "action" : "actions"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationDetail({
  integration,
  onBack,
}: {
  integration: Integration;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-lg ${integration.bgColor} shrink-0`}>
          {integration.logo ? (
            integration.logo()
          ) : (
            <integration.icon size={32} className={integration.color} />
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold">{integration.name}</h1>
          <p className="text-sm text-muted-foreground">
            {integration.description}
          </p>
          <Badge variant="secondary" className="text-xs mt-1">
            {integration.actions.length}{" "}
            {integration.actions.length === 1 ? "action" : "actions"}
          </Badge>
        </div>
      </div>

      {/* Actions list */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Available Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integration.actions.map((action) => (
            <Card key={action.name} className="rounded-none">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-md ${integration.bgColor} shrink-0`}
                  >
                    <action.icon size={16} className={integration.color} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{action.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedIntegration = selected
    ? integrations.find((i) => i.id === selected) ?? null
    : null;

  const totalActions = integrations.reduce(
    (sum, i) => sum + i.actions.length,
    0,
  );

  if (selectedIntegration) {
    return (
      <div className="p-6">
        <IntegrationDetail
          integration={selectedIntegration}
          onBack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            {integrations.length} integrations &middot; {totalActions} total
            actions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onClick={() => setSelected(integration.id)}
          />
        ))}
      </div>
    </div>
  );
}
