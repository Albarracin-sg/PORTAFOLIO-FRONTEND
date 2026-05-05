import { apiRequest } from './http';

export type BotChatRequest = {
  message: string;
  conversationId?: string;
};

export type BotChatResponse = {
  reply: string;
  conversationId: string;
};

export interface BotThread {
  id: string;
  personaId: string;
  title: string | null;
  createdAt: string;
  _count: {
    messages: number;
  };
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }[];
}

export interface BotThreadsResponse {
  items: BotThread[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function sendBotMessage(payload: BotChatRequest): Promise<BotChatResponse> {
  return apiRequest<BotChatResponse>('/bot/chat', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchBotThreads(token: string, page = 1, limit = 10): Promise<BotThreadsResponse> {
  return apiRequest<BotThreadsResponse>(`/admin/bot/threads?page=${page}&limit=${limit}`, {
    token,
  });
}

export async function deleteBotThread(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/admin/bot/threads/${id}`, {
    method: 'DELETE',
    token,
  });
}