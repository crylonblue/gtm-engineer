import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (!_client) {
    const url = process.env.CONVEX_URL;
    if (!url) throw new Error("CONVEX_URL environment variable is not set");
    _client = new ConvexHttpClient(url);
  }
  return _client;
}

export interface LeadDoc {
  _id: string;
  email?: string;
  name?: string;
  company?: string;
  status?: string;
  source?: string;
  linkedin?: string;
  data?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export async function createLead(args: {
  email?: string;
  name?: string;
  company?: string;
  status?: string;
  source?: string;
  data?: Record<string, unknown>;
}): Promise<string> {
  return await getClient().mutation(anyApi.leads.create, args) as string;
}

export async function bulkCreateLeads(leads: Array<{
  email?: string;
  name?: string;
  company?: string;
  status?: string;
  source?: string;
  linkedin?: string;
  data?: Record<string, unknown>;
}>): Promise<string[]> {
  return await getClient().mutation(anyApi.leads.bulkCreate, { leads }) as string[];
}

export async function getLead(id: string): Promise<LeadDoc | null> {
  return await getClient().query(anyApi.leads.get, { id }) as LeadDoc | null;
}

export async function updateLead(args: {
  id: string;
  email?: string;
  name?: string;
  company?: string;
  status?: string;
  source?: string;
  data?: Record<string, unknown>;
}): Promise<LeadDoc> {
  return await getClient().mutation(anyApi.leads.update, args) as LeadDoc;
}

export async function deleteLead(id: string): Promise<void> {
  await getClient().mutation(anyApi.leads.remove, { id });
}

export async function listLeads(limit?: number): Promise<LeadDoc[]> {
  return await getClient().query(anyApi.leads.list, { limit }) as LeadDoc[];
}

export async function searchLeadsByField(
  field: "email" | "status" | "source" | "company" | "linkedin",
  value: string,
  limit?: number
): Promise<LeadDoc[]> {
  return await getClient().query(anyApi.leads.searchByField, { field, value, limit }) as LeadDoc[];
}

export async function searchLeadsByFilter(filters: {
  email?: string;
  status?: string;
  source?: string;
  company?: string;
  linkedin?: string;
  limit?: number;
}): Promise<LeadDoc[]> {
  return await getClient().query(anyApi.leads.searchByFilter, filters) as LeadDoc[];
}
