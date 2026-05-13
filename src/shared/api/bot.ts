import { apiRequest } from './http';

const BOT_MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

type BotMessageRole = (typeof BOT_MESSAGE_ROLE)[keyof typeof BOT_MESSAGE_ROLE];

export type BotChatRequest = {
  message: string;
  conversationId?: string;
};

export type BotChatResponse = {
  reply: string;
  conversationId: string;
};

interface BotThreadCount {
  messages: number;
}

interface BotThreadPersona {
  id: string;
  name: string | null;
}

export interface BotThreadMessage {
  id: string;
  role: BotMessageRole;
  content: string;
  createdAt: string;
}

export interface BotThread {
  id: string;
  personaId: string;
  persona: BotThreadPersona | null;
  title: string | null;
  createdAt: string;
  _count: BotThreadCount;
  messages: BotThreadMessage[];
}

function sortMessages(messages: BotThreadMessage[]): BotThreadMessage[] {
  return messages.toSorted(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBotMessageRole(value: unknown): value is BotMessageRole {
  return typeof value === 'string' && Object.values(BOT_MESSAGE_ROLE).includes(value as BotMessageRole);
}

function normalizeBotMessage(input: unknown): BotThreadMessage | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = typeof input.id === 'string' ? input.id : null;
  const content = typeof input.content === 'string' ? input.content : null;
  const createdAt = typeof input.createdAt === 'string' ? input.createdAt : null;
  const role = isBotMessageRole(input.role) ? input.role : BOT_MESSAGE_ROLE.ASSISTANT;

  if (!id || !content || !createdAt) {
    return null;
  }

  return {
    id,
    role,
    content,
    createdAt,
  };
}

function normalizeBotThread(input: unknown): BotThread | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = typeof input.id === 'string' ? input.id : null;
  const rawPersona = isRecord(input.persona) ? input.persona : null;
  const personaId =
    typeof input.personaId === 'string'
      ? input.personaId
      : typeof rawPersona?.id === 'string'
        ? rawPersona.id
        : null;
  const title = typeof input.title === 'string' ? input.title : null;
  const createdAt = typeof input.createdAt === 'string' ? input.createdAt : null;

  if (!id || !personaId || !createdAt) {
    return null;
  }

  const rawCount = isRecord(input._count) ? input._count : null;
  const rawMessages = Array.isArray(input.messages) ? input.messages : [];

  const messages = sortMessages(
    rawMessages.reduce<BotThreadMessage[]>((acc, message) => {
      const normalized = normalizeBotMessage(message);
      if (normalized !== null) {
        acc.push(normalized);
      }
      return acc;
    }, []),
  );

  return {
    id,
    personaId,
    persona: rawPersona
      ? {
          id: typeof rawPersona.id === 'string' ? rawPersona.id : personaId,
          name: typeof rawPersona.name === 'string' ? rawPersona.name : null,
        }
      : null,
    title,
    createdAt,
    _count: {
      messages: typeof rawCount?.messages === 'number' ? rawCount.messages : messages.length,
    },
    messages,
  };
}

function normalizeThreadsResponse(input: unknown): BotThreadsResponse {
  if (!isRecord(input)) {
    return {
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }

  const rawItems = Array.isArray(input.items) ? input.items : [];
  const rawMeta = isRecord(input.meta) ? input.meta : null;

  const items = rawItems.reduce<BotThread[]>((acc, thread) => {
    const normalized = normalizeBotThread(thread);
    if (normalized !== null) {
      acc.push(normalized);
    }
    return acc;
  }, []);

  return {
    items,
    meta: {
      total: typeof rawMeta?.total === 'number' ? rawMeta.total : items.length,
      page: typeof rawMeta?.page === 'number' ? rawMeta.page : 1,
      limit: typeof rawMeta?.limit === 'number' ? rawMeta.limit : items.length,
      totalPages: typeof rawMeta?.totalPages === 'number' ? rawMeta.totalPages : 1,
    },
  };
}

function normalizeMessagesResponse(input: unknown): BotThreadMessage[] {
  if (Array.isArray(input)) {
    return input.reduce<BotThreadMessage[]>((acc, message) => {
      const normalized = normalizeBotMessage(message);
      if (normalized !== null) {
        acc.push(normalized);
      }
      return acc;
    }, []);
  }

  if (!isRecord(input)) {
    return [];
  }

  const candidates = [input.items, input.messages].find((value) => Array.isArray(value));

  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates
    .map((message) => normalizeBotMessage(message))
    .filter((message): message is BotThreadMessage => message !== null);
}

export async function sendBotMessage(payload: BotChatRequest): Promise<BotChatResponse> {
  return apiRequest<BotChatResponse>('/bot/chat', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchBotThreads(token: string, page = 1, limit = 10, q = ''): Promise<BotThreadsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) {
    query.set('q', q);
  }
  const response = await apiRequest<unknown>(`/admin/bot/threads?${query.toString()}`, {
    token,
  });

  return normalizeThreadsResponse(response);
}

export async function fetchBotThreadMessages(token: string, id: string): Promise<BotThreadMessage[]> {
  const response = await apiRequest<unknown>(`/admin/bot/threads/${id}/messages`, {
    token,
  });

  return sortMessages(normalizeMessagesResponse(response));
}

export async function analyzeBotThread(token: string, id: string): Promise<string> {
  const response = await apiRequest<{ analysis: string }>(`/admin/bot/threads/${id}/analyze`, {
    method: 'POST',
    token,
  });

  return response.analysis;
}

export async function analyzeBulkThreads(token: string, q = ''): Promise<string> {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  const response = await apiRequest<{ analysis: string }>(`/admin/bot/threads/analyze${query}`, {
    method: 'POST',
    token,
  });

  return response.analysis;
}

export async function deleteBotThread(token: string, id: string): Promise<void> {
  await apiRequest<unknown>(`/admin/bot/threads/${id}`, {
    method: 'DELETE',
    token,
  });
}
