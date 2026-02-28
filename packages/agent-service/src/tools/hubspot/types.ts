export interface HubSpotObject<T = Record<string, string>> {
  id: string;
  properties: T;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotSearchResponse<T = Record<string, string>> {
  total: number;
  results: HubSpotObject<T>[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface HubSpotAssociationTarget {
  id: string;
  type: string;
}

export interface HubSpotObjectWithAssociations<T = Record<string, string>>
  extends HubSpotObject<T> {
  associations?: Record<
    string,
    { results: HubSpotAssociationTarget[] }
  >;
}

export interface HubSpotFilter {
  propertyName: string;
  operator: string;
  value?: string;
}

export interface HubSpotFilterGroup {
  filters: HubSpotFilter[];
}

export interface HubSpotCreateBody {
  properties: Record<string, string>;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: "HUBSPOT_DEFINED";
      associationTypeId: number;
    }>;
  }>;
}
