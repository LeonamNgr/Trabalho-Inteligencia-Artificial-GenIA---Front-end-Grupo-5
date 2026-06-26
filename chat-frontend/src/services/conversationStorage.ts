import type { ConversationSummary } from '../types/conversation';
import type { Message } from '../types/message';

const CONVERSATIONS_KEY = (sid: string) => `chat:conversations:${sid}`;
const MESSAGES_KEY = (sid: string, cid: number) => `chat:messages:${sid}:${cid}`;

export function loadConversations(sessionId: string): ConversationSummary[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(sessionId: string, conversations: ConversationSummary[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY(sessionId), JSON.stringify(conversations));
  } catch { /* quota exceeded etc */ }
}

export function loadMessages(sessionId: string, conversationId: number): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY(sessionId, conversationId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(sessionId: string, conversationId: number, messages: Message[]) {
  try {
    localStorage.setItem(MESSAGES_KEY(sessionId, conversationId), JSON.stringify(messages));
  } catch { /* quota exceeded etc */ }
}

export function removeConversation(sessionId: string, conversationId: number) {
  try {
    localStorage.removeItem(MESSAGES_KEY(sessionId, conversationId));
  } catch { /* ignore */ }
}
