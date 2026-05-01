import useSWR from 'swr';
import { fetcher, postFetcher } from './api.instance';

// Types
export interface Recipient {
  id: string;
  email: string;
  name: string;
  created_at: string;
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

export interface CreateRecipientData {
  email: string;
  name: string;
}

// Hooks
export const useRecipients = () => {
  return useSWR<PaginatedResponse<Recipient>>('/recipients', fetcher);
};

// Actions (mutations)
export const createRecipient = async (data: CreateRecipientData) => {
  return postFetcher<Recipient>('/recipients', data);
};
