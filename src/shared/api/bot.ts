import { apiRequest } from './http';

export type BotChatRequest = {
  message: string;
  conversationId?: string;
};

export type BotChatResponse = {
  reply: string;
  conversationId: string;
};

export async function sendBotMessage(payload: BotChatRequest): Promise<BotChatResponse> {
  return apiRequest<BotChatResponse>('/bot/chat', {
    method: 'POST',
    body: payload,
  });
}