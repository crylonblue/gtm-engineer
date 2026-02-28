export interface ProspeoPersonEmail {
  status: string;
  revealed: boolean;
  email?: string;
  masked_email?: string;
  verification_method?: string;
}

export interface ProspeoPersonMobile {
  status: string;
  revealed: boolean;
  number?: string;
  masked_number?: string;
}

export interface ProspeoLocation {
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
}

export interface ProspeoJobHistoryEntry {
  title?: string;
  company_name?: string;
  company_linkedin_url?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface ProspecoPerson {
  person_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  linkedin_url?: string;
  current_job_title?: string;
  headline?: string;
  email?: ProspeoPersonEmail;
  mobile?: ProspeoPersonMobile;
  location?: ProspeoLocation;
  skills?: string[];
  job_history?: ProspeoJobHistoryEntry[];
}

export interface ProspeoCompanyLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface ProspeoFunding {
  stage?: string;
  total_funding?: string;
  events?: Array<{
    date?: string;
    amount?: string;
    round?: string;
  }>;
}

export interface ProspeoCompany {
  company_id: string;
  name: string;
  website?: string;
  domain?: string;
  description?: string;
  type?: string;
  industry?: string;
  employee_count?: number;
  employee_range?: string;
  location?: ProspeoCompanyLocation;
  linkedin_url?: string;
  twitter_url?: string;
  crunchbase_url?: string;
  founded?: string;
  revenue_range?: string;
  funding?: ProspeoFunding;
  technology?: string[];
}

export interface ProspeoEnrichPersonResponse {
  error: boolean;
  free_enrichment?: boolean;
  person?: ProspecoPerson;
  company?: ProspeoCompany | null;
}

export interface ProspeoEnrichCompanyResponse {
  error: boolean;
  free_enrichment?: boolean;
  company?: ProspeoCompany;
}

export interface ProspeoBulkMatchedPerson {
  identifier: string;
  person: ProspecoPerson;
  company: ProspeoCompany | null;
}

export interface ProspeoBulkEnrichPersonResponse {
  error: boolean;
  total_cost: number;
  matched: ProspeoBulkMatchedPerson[];
  not_matched: string[];
  invalid_datapoints: string[];
}

export interface ProspeoBulkMatchedCompany {
  identifier: string;
  company: ProspeoCompany;
}

export interface ProspeoBulkEnrichCompanyResponse {
  error: boolean;
  total_cost: number;
  matched: ProspeoBulkMatchedCompany[];
  not_matched: string[];
  invalid_datapoints: string[];
}

export interface ProspeoSearchPagination {
  current_page: number;
  per_page: number;
  total_page: number;
  total_count: number;
}

export interface ProspeoSearchPersonResponse {
  error: boolean;
  results: Array<{ person: ProspecoPerson; company: ProspeoCompany }>;
  pagination: ProspeoSearchPagination;
}

export interface ProspeoSearchCompanyResponse {
  error: boolean;
  results: Array<{ company: ProspeoCompany }>;
  pagination: ProspeoSearchPagination;
}

export interface ProspeoSearchSuggestionsResponse {
  error: boolean;
  location_suggestions: Array<{ name: string; type: string }> | null;
  job_title_suggestions: string[] | null;
}

export interface ProspeoAccountInfoResponse {
  error: boolean;
  response: {
    current_plan: string;
    current_team_members: number;
    remaining_credits: number;
    used_credits: number;
    next_quota_renewal_days: number;
    next_quota_renewal_date: string;
  };
}
