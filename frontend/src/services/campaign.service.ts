import useSWR from 'swr';
import { fetcher, postFetcher, patchFetcher, deleteFetcher } from './api.instance';

// Types
export type CampaignStatus = 'draft' | 'sending' | 'scheduled' | 'sent';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_at: string;
  stats?: CampaignStats;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface CampaignDetail extends Campaign {
  body: string;
  updated_at: string;
  stats: CampaignStats;
  recipients: CampaignRecipient[];
}

export interface CampaignRecipient {
  id: string;
  email: string;
  name: string;
  sent_at: string | null;
  opened_at: string | null;
  status: 'pending' | 'sent' | 'failed';
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  body: string;
  recipient_ids: string[];
}

export interface UpdateCampaignData {
  name?: string;
  subject?: string;
  body?: string;
}

export interface ScheduleCampaignData {
  scheduledAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Hooks
export const useCampaigns = () => {
  return useSWR<PaginatedResponse<Campaign>>('/campaigns', fetcher);
};

export const useCampaign = (id: number | string) => {
  return useSWR<CampaignDetail>(`/campaigns/${id}`, fetcher);
};

export const useCampaignStats = (id: number | string) => {
  return useSWR<CampaignStats>(`/campaigns/${id}/stats`, fetcher);
};

// Actions (mutations)
export const createCampaign = async (data: CreateCampaignData) => {
  return postFetcher<Campaign>('/campaigns', data);
};

export const updateCampaign = async (id: number | string, data: UpdateCampaignData) => {
  return patchFetcher<Campaign>(`/campaigns/${id}`, data);
};

export const deleteCampaign = async (id: number | string) => {
  return deleteFetcher<{ message: string }>(`/campaigns/${id}`);
};

export const scheduleCampaign = async (id: number | string, data: ScheduleCampaignData) => {
  return postFetcher<Campaign>(`/campaigns/${id}/schedule`, data);
};

export const sendCampaign = async (id: number | string) => {
  return postFetcher<{ message: string; stats: CampaignStats }>(`/campaigns/${id}/send`);
};
