export interface LinkedInPerson {
  id: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  location?: string;
  profile_url?: string;
  profile_picture_url?: string;
  network_distance?: string;
}

export interface LinkedInCompany {
  id: string;
  name?: string;
  description?: string;
  industry?: string;
  website?: string;
  employee_count?: string;
  logo_url?: string;
  headquarters?: string;
}

export interface LinkedInChat {
  id: string;
  provider: string;
  account_id: string;
  attendees?: Array<{ id: string; name?: string }>;
  last_message?: string;
  timestamp?: string;
}

export interface LinkedInMessage {
  id: string;
  text?: string;
  sender_id?: string;
  timestamp?: string;
  attachments?: Array<{ type: string; url?: string }>;
}

export interface LinkedInInvitation {
  id: string;
  status?: string;
  sent_at?: string;
  recipient?: LinkedInPerson;
  message?: string;
}

export interface LinkedInPost {
  id: string;
  text?: string;
  author_id?: string;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  cursor?: string;
  has_more?: boolean;
}
